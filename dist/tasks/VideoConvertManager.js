"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleMedia = void 0;
const tslib_1 = require("tslib");
const Logger_1 = require("../Logger");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const VideoInfoManager_1 = require("./VideoInfoManager");
const VideoDownloadManager_1 = require("./VideoDownloadManager");
const InvokeManager_1 = require("../InvokeManager");
const STATUS_KEY = "CONVERTER";
async function HandleMedia(item) {
    if (item.hasStatus(STATUS_KEY)) {
        Logger_1.logInfo("Media Already Handled, skipping");
        return;
    }
    const tempFolder = VideoDownloadManager_1.getTempFolder(item);
    let chosenExt = ".mp4";
    if (item.info.opts.choice === "audio") {
        chosenExt = ".mp3";
    }
    const fileName = `${VideoInfoManager_1.GetMediaTitle(item)}${chosenExt}`;
    const outputPath = path_1.default.join(item.info.opts.output, fileName);
    Logger_1.logInfo(`Output: ${outputPath}`);
    // only one file
    if (item.info.fileList.length === 1) {
        const [filePath] = item.info.fileList;
        const fileExt = path_1.default.extname(filePath);
        // correct format
        if (fileExt === chosenExt) {
            Logger_1.logInfo("Copying file to output");
            await fs_extra_1.default.copy(filePath, outputPath);
        }
        // needs converting
        else {
            VideoInfoManager_1.setStatusText(item, "Convering");
            const convertPath = path_1.default.join(tempFolder, `convert${chosenExt}`);
            Logger_1.logInfo(`Converting to ${convertPath}`);
            const convertProcess = InvokeManager_1.convert(filePath, convertPath);
            item.eventHandler.onOnceCancel(() => {
                convertProcess.cancel();
                fs_extra_1.default.remove(convertPath);
            });
            await convertProcess.promise;
            item.eventHandler.removeCancelListeners();
            Logger_1.logInfo(`Copying to ${outputPath}`);
            await fs_extra_1.default.copy(convertPath, outputPath);
        }
    }
    // two files
    else {
        VideoInfoManager_1.setStatusText(item, "Combining");
        const [filePath1, filePath2] = item.info.fileList;
        const combinedPath = path_1.default.join(tempFolder, `combined${chosenExt}`);
        Logger_1.logInfo(`Combining to ${combinedPath}`);
        Logger_1.logInfo(`File1: ${filePath1}`);
        Logger_1.logInfo(`File2: ${filePath2}`);
        const combineProcess = InvokeManager_1.combine([filePath1, filePath2], combinedPath);
        item.eventHandler.onOnceCancel(() => {
            combineProcess.cancel();
            fs_extra_1.default.remove(combinedPath);
        });
        await combineProcess.promise;
        item.eventHandler.removeCancelListeners();
        Logger_1.logInfo(`Copying to ${outputPath}`);
        await fs_extra_1.default.copy(combinedPath, outputPath);
    }
    await fs_extra_1.default.remove(tempFolder);
}
exports.HandleMedia = HandleMedia;
