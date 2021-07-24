import { FormatEnum } from ".";
import Events from "events";
import { Format } from "youtube-dl-dal/dist/videoinfo";
import * as VideoInfoManager from "./tasks/VideoInfoManager";
import * as VideoDownloadManager from "./tasks/VideoDownloadManager";
import * as VideoConvertManager from "./tasks/VideoConvertManager";
import { logError, logInfo } from "./Logger";
import _, { head, max } from "lodash";
import { fstat, remove } from "fs-extra";

/** This is the queue that all of the items will be */
export let Queue = new Array<QueueItem>();

/**Will return the count of items that are in progress */
export function getInProgressCount() {
  return Queue.filter((item) => item.isInProgress).length;
}
/** Gets a list of items that are ready to go */
export function getReadyList() {
  return Queue.filter(
    (item) =>
      !item.isInProgress && !item.isFinished && !item.isStopped && item.isReady
  );
}
/** Gets the next id for an item */
export function getNextId(): number {
  const nextid = max(Queue.map((item) => item.id));
  return isNaN(nextid) ? 1 : nextid + 1;
}
/**adds an item to the list */
export function add(item: QueueItem) {
  Queue.push(item);
}
/** gets the number of items that are in the queue */
export function getQueueCount() {
  return Queue.length;
}

class VideoEvents extends Events {
  onOnceCancel(fn: () => void) {
    this.once("cancel", fn);
  }
  removeCancelListeners() {
    this.removeAllListeners("cancel");
  }
  fireCancel() {
    this.emit("cancel");
  }
}
interface QueueItemOpts {
  choice: keyof typeof FormatEnum;
  url: string;
  output: string;
}
interface QueueItemInfo {
  opts: QueueItemOpts;
  fileList: string[];
  formatList: Format[];
  statusMap: { [key: string]: any };
  statusText: string;
  thumbnailUrl: string;
  title: string;
}

export class QueueItem {
  info: QueueItemInfo;
  eventHandler = new VideoEvents();
  isReady = true;
  isStopped = false;
  isInProgress = false;
  isFinished = false;
  id = getNextId();

  setStatus(key: string, value: string) {
    logInfo(`Setting status ${key} to ${value}`);
    this.info.statusMap[key] = value;
  }

  getStatus(key: string): string {
    let value = this.info.statusMap[key];
    logInfo(`Setting status ${key}, which is ${value}`);
    return value;
  }

  hasStatus(key: string) {
    let hasStatus = Object.keys(this.info.statusMap).includes(key);
    logInfo(`Checking if it has status ${key}, answer is ${hasStatus}`);
    return hasStatus;
  }

  getStatusMap() {
    const map = new Map();
    for (const [key, value] of Object.entries(this.info.statusMap)) {
      map.set(key, value);
    }
    return map;
  }

  setStatusMap(map: Map<string, any>) {
    this.info.statusMap = {};
    for (const [key, value] of map.entries()) {
      this.info.statusMap[key] = value;
    }
    return map;
  }

  /** Stop the execution of this item */
  Cancel() {
    this.isStopped = true;
    this.isReady = false;
    this.isInProgress = false;
    VideoInfoManager.setStatusText(this, "Stopped");
    this.eventHandler.fireCancel();
  }
  /** Resumes the execution of this item */
  Resume() {
    this.isStopped = false;
    this.isReady = true;
    VideoInfoManager.setStatusText(this, null);
  }

  /** Removes this item from the queue */
  Remove() {
    this.Cancel();
    _.remove(Queue, (item) => item === this);
    remove(VideoDownloadManager.getTempFolder(this));
    Queue = Queue;
  }
}

export function removeItem(id: number) {}

export function addVideoItem(opts: QueueItemOpts) {
  const item = new QueueItem();
  item.info = {
    formatList: [],
    opts: opts,
    statusMap: {},
    fileList: [],
    statusText: null,
    thumbnailUrl: null,
    title: null,
  };
  add(item);
}

function intervalCheck() {
  if (getQueueCount() === 0) {
    return;
  }
  const inProgressCount = getInProgressCount();
  if (inProgressCount > 0) {
    return;
  }
  const notInProgressItems = getReadyList();
  if (notInProgressItems.length === 0) {
    return;
  }

  const item = head(notInProgressItems);
  item.isInProgress = true;
  DoTheItem(item)
    .catch((e) => {
      logError(e.message);
    })
    .finally(() => {
      item.isInProgress = false;
    });
}

setInterval(intervalCheck, 500);

const queueTaskList = [
  VideoInfoManager.ResolveFormatList,
  VideoDownloadManager.DownloadMaterial,
  VideoConvertManager.HandleMedia,
];

async function DoTheItem(item: QueueItem) {
  for (const queueTask of queueTaskList) {
    await queueTask(item);
    if (item.isStopped) {
      return;
    }
  }
  item.isFinished = true;
  VideoInfoManager.setStatusText(item, "Finished");
}
