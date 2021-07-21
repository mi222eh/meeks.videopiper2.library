"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTempFolder = exports.DownloadMaterial = void 0;
const tslib_1 = require("tslib");
const Logger_1 = require("../Logger");
const path_1 = tslib_1.__importDefault(require("path"));
const InvokeManager_1 = require("../InvokeManager");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const VideoInfoManager_1 = require("./VideoInfoManager");
const STATUS_KEY = "DOWNLOAD";
const TEMP_FOLDER = "";
async function DownloadMaterial(item) {
    if (item.hasStatus(STATUS_KEY)) {
        Logger_1.logInfo("Has already downloaded materials");
        return;
    }
    const folder = getTempFolder(item);
    VideoInfoManager_1.setStatusText(item, "Downloading materials...");
    for (const format of item.info.formatList) {
        const format_id = format.format_id;
        const mediaPath = path_1.default.join(folder, `${format_id}.${format.ext}`);
        Logger_1.logInfo(`format: ${format_id}`);
        Logger_1.logInfo(`path: ${mediaPath}`);
        if (await fs_extra_1.default.pathExists(mediaPath)) {
            Logger_1.logInfo("Path exists, will skip...");
            Logger_1.logInfo(mediaPath);
            continue;
        }
        let cancelFunction = () => {
            downloadProces.cancel();
            fs_extra_1.default.remove(mediaPath);
        };
        Logger_1.logInfo("Download Starting");
        let downloadProces = InvokeManager_1.download(item.info.opts.url, format.format_id, mediaPath);
        item.eventHandler.onOnceCancel(cancelFunction);
        await downloadProces.promise;
        item.eventHandler.removeCancelListeners();
        item.info.fileList.push(mediaPath);
    }
    item.setStatus(STATUS_KEY, "DOWNLOADED");
}
exports.DownloadMaterial = DownloadMaterial;
function getTempFolder(item) {
    if (item.hasStatus(TEMP_FOLDER)) {
        Logger_1.logInfo("Temp folder exists");
        Logger_1.logInfo(item.getStatus(TEMP_FOLDER));
        return item.getStatus(TEMP_FOLDER);
    }
    Logger_1.logInfo("Making temp folder");
    const folderPath = path_1.default.join(item.info.opts.output, `temp-${item.id}`);
    item.setStatus(TEMP_FOLDER, folderPath);
    Logger_1.logInfo(item.getStatus(TEMP_FOLDER));
    return folderPath;
}
exports.getTempFolder = getTempFolder;
