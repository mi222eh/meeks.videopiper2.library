import { getInfo } from "../InvokeManager";
import { logError, logInfo } from "../Logger";
import { QueueItem } from "../QueueManager";
import { getVideoInfo, VideoInfo } from "../VideoInfo";
import sanitize from "sanitize-filename";

const STATE_KEY = "INFO_GET_DONE";
const TITLE_KEY = "MEDIA_TITLE";
const THUMBNAIL_URL = "THUMBNAIL_URL";
const STATUSTEXT_KEY = "STATUS_TEXT";

export async function ResolveFormatList(item: QueueItem) {
  try {
    if (item.hasStatus(STATE_KEY)) {
      logInfo("Already Finished, skipping");
      return;
    }

    const chosenFormat = item.info.opts.choice;
    const process = getInfo(item.info.opts.url);

    item.eventHandler.onOnceCancel(() => process.cancel());

    logInfo("Getting Video Info");
    setStatusText(item, "Getting Video Info");

    const info = new VideoInfo(await process.promise);
    item.setStatus(TITLE_KEY, sanitize(info.getTitle()));
    item.setStatus(THUMBNAIL_URL, info.getThumbnailPicture());

    item.info.title = info.getTitle();
    item.info.thumbnailUrl = info.getThumbnailPicture();

    item.eventHandler.removeCancelListeners();

    let format = info.getFormat[chosenFormat]();
    if (!format && chosenFormat !== "audio") {
      format = info.getVideoFormats()[0];
    }
    item.info.formatList.push(format);
    if (format.acodec.toLowerCase() === "none") {
      const audio = info.getBestAudioFormat();
      item.info.formatList.push(audio);
    }
    item.setStatus(STATE_KEY, "YES");
  } catch (e) {
    logError(e.message);
  }
}

export function GetMediaTitle(item: QueueItem) {
  return item.getStatus(TITLE_KEY);
}

export function GetMediaThumbnail(item: QueueItem) {
  return item.getStatus(THUMBNAIL_URL);
}
export function setStatusText(item: QueueItem, statusText: string) {
  item.info.statusText = statusText;
}
// export function GetStatusText(item: QueueItem) {
//   return item.info.statusText
// }
