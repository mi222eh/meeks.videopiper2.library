"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStatusText = exports.GetMediaThumbnail = exports.GetMediaTitle = exports.ResolveFormatList = void 0;
const tslib_1 = require("tslib");
const InvokeManager_1 = require("../InvokeManager");
const Logger_1 = require("../Logger");
const VideoInfo_1 = require("../VideoInfo");
const sanitize_filename_1 = tslib_1.__importDefault(require("sanitize-filename"));
const STATE_KEY = "INFO_GET_DONE";
const TITLE_KEY = "MEDIA_TITLE";
const THUMBNAIL_URL = "THUMBNAIL_URL";
const STATUSTEXT_KEY = "STATUS_TEXT";
async function ResolveFormatList(item) {
    try {
        if (item.hasStatus(STATE_KEY)) {
            Logger_1.logInfo("Already Finished, skipping");
            return;
        }
        const chosenFormat = item.info.opts.choice;
        const process = InvokeManager_1.getInfo(item.info.opts.url);
        item.eventHandler.onOnceCancel(() => process.cancel());
        Logger_1.logInfo("Getting Video Info");
        setStatusText(item, "Getting Video Info");
        const info = new VideoInfo_1.VideoInfo(await process.promise);
        item.setStatus(TITLE_KEY, sanitize_filename_1.default(info.getTitle()));
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
    }
    catch (e) {
        Logger_1.logError(e.message);
    }
}
exports.ResolveFormatList = ResolveFormatList;
function GetMediaTitle(item) {
    return item.getStatus(TITLE_KEY);
}
exports.GetMediaTitle = GetMediaTitle;
function GetMediaThumbnail(item) {
    return item.getStatus(THUMBNAIL_URL);
}
exports.GetMediaThumbnail = GetMediaThumbnail;
function setStatusText(item, statusText) {
    item.info.statusText = statusText;
}
exports.setStatusText = setStatusText;
// export function GetStatusText(item: QueueItem) {
//   return item.info.statusText
// }
