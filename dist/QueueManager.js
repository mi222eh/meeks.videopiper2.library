"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVideoItem = exports.QueueItem = exports.getQueueCount = exports.add = exports.getNextId = exports.getReadyList = exports.getInProgressCount = exports.Queue = void 0;
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("events"));
const VideoInfoManager = tslib_1.__importStar(require("./tasks/VideoInfoManager"));
const VideoDownloadManager = tslib_1.__importStar(require("./tasks/VideoDownloadManager"));
const VideoConvertManager = tslib_1.__importStar(require("./tasks/VideoConvertManager"));
const Logger_1 = require("./Logger");
const lodash_1 = tslib_1.__importStar(require("lodash"));
const fs_extra_1 = require("fs-extra");
/** This is the queue that all of the items will be */
exports.Queue = new Array();
/**Will return the count of items that are in progress */
function getInProgressCount() {
    return exports.Queue.filter((item) => item.isInProgress).length;
}
exports.getInProgressCount = getInProgressCount;
/** Gets a list of items that are ready to go */
function getReadyList() {
    return exports.Queue.filter((item) => !item.isInProgress && !item.isFinished && !item.isStopped && item.isReady);
}
exports.getReadyList = getReadyList;
/** Gets the next id for an item */
function getNextId() {
    const nextid = lodash_1.max(exports.Queue.map((item) => item.id));
    return isNaN(nextid) ? 1 : nextid + 1;
}
exports.getNextId = getNextId;
/**adds an item to the list */
function add(item) {
    exports.Queue.push(item);
}
exports.add = add;
/** gets the number of items that are in the queue */
function getQueueCount() {
    return exports.Queue.length;
}
exports.getQueueCount = getQueueCount;
class VideoEvents extends events_1.default {
    onOnceCancel(fn) {
        this.once("cancel", fn);
    }
    removeCancelListeners() {
        this.removeAllListeners("cancel");
    }
    fireCancel() {
        this.emit("cancel");
    }
}
class QueueItem {
    constructor() {
        this.eventHandler = new VideoEvents();
        this.isReady = true;
        this.isStopped = false;
        this.isInProgress = false;
        this.isFinished = false;
        this.id = getNextId();
    }
    setStatus(key, value) {
        Logger_1.logInfo(`Setting status ${key} to ${value}`);
        this.info.statusMap[key] = value;
    }
    getStatus(key) {
        let value = this.info.statusMap[key];
        Logger_1.logInfo(`Setting status ${key}, which is ${value}`);
        return value;
    }
    hasStatus(key) {
        let hasStatus = Object.keys(this.info.statusMap).includes(key);
        Logger_1.logInfo(`Checking if it has status ${key}, answer is ${hasStatus}`);
        return hasStatus;
    }
    getStatusMap() {
        const map = new Map();
        for (const [key, value] of Object.entries(this.info.statusMap)) {
            map.set(key, value);
        }
        return map;
    }
    setStatusMap(map) {
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
        lodash_1.default.remove(exports.Queue, (item) => item === this);
        fs_extra_1.remove(VideoDownloadManager.getTempFolder(this));
    }
}
exports.QueueItem = QueueItem;
function addVideoItem(opts) {
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
exports.addVideoItem = addVideoItem;
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
    const item = lodash_1.head(notInProgressItems);
    item.isInProgress = true;
    DoTheItem(item)
        .catch((e) => {
        Logger_1.logError(e.message);
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
async function DoTheItem(item) {
    for (const queueTask of queueTaskList) {
        await queueTask(item);
        if (item.isStopped) {
            return;
        }
    }
    item.isFinished = true;
    VideoInfoManager.setStatusText(item, "Finished");
}
