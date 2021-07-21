import { logInfo } from "../Logger";
import { QueueItem } from "../QueueManager";
import path from "path";
import fs from "fs-extra";
import { GetMediaTitle, setStatusText } from "./VideoInfoManager";
import { getTempFolder } from "./VideoDownloadManager";
import { combine, convert } from "../InvokeManager";

const STATUS_KEY = "CONVERTER";

export async function HandleMedia(item: QueueItem) {
  if (item.hasStatus(STATUS_KEY)) {
    logInfo("Media Already Handled, skipping");
    return;
  }

  const tempFolder = getTempFolder(item);
  let chosenExt = ".mp4";
  if (item.info.opts.choice === "audio") {
    chosenExt = ".mp3";
  }
  const fileName = `${GetMediaTitle(item)}${chosenExt}`;
  const outputPath = path.join(item.info.opts.output, fileName);
  logInfo(`Output: ${outputPath}`);
  // only one file
  if (item.info.fileList.length === 1) {
    const [filePath] = item.info.fileList;
    const fileExt = path.extname(filePath);
    // correct format
    if (fileExt === chosenExt) {
      logInfo("Copying file to output");
      await fs.copy(filePath, outputPath);
    }
    // needs converting
    else {
      setStatusText(item, "Convering");
      const convertPath = path.join(tempFolder, `convert${chosenExt}`);
      logInfo(`Converting to ${convertPath}`);
      const convertProcess = convert(filePath, convertPath);
      item.eventHandler.onOnceCancel(() => {
        convertProcess.cancel();
        fs.remove(convertPath);
      });
      await convertProcess.promise;
      item.eventHandler.removeCancelListeners();
      logInfo(`Copying to ${outputPath}`);
      await fs.copy(convertPath, outputPath);
    }
  }
  // two files
  else {
    setStatusText(item, "Combining");
    const [filePath1, filePath2] = item.info.fileList;
    const combinedPath = path.join(tempFolder, `combined${chosenExt}`);
    logInfo(`Combining to ${combinedPath}`);
    logInfo(`File1: ${filePath1}`);
    logInfo(`File2: ${filePath2}`);
    const combineProcess = combine([filePath1, filePath2], combinedPath);
    item.eventHandler.onOnceCancel(() => {
      combineProcess.cancel();
      fs.remove(combinedPath);
    });
    await combineProcess.promise;
    item.eventHandler.removeCancelListeners();
    logInfo(`Copying to ${outputPath}`);
    await fs.copy(combinedPath, outputPath);
  }

  await fs.remove(tempFolder);
}
