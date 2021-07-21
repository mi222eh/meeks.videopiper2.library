import { logInfo } from "../Logger";
import { QueueItem } from "../QueueManager";
import path from "path";
import { download } from "../InvokeManager";
import fs from "fs-extra";
import { setStatusText } from "./VideoInfoManager";

const STATUS_KEY = "DOWNLOAD";
const TEMP_FOLDER = "";

export async function DownloadMaterial(item: QueueItem) {
  if (item.hasStatus(STATUS_KEY)) {
    logInfo("Has already downloaded materials");
    return;
  }
  const folder = getTempFolder(item);
  setStatusText(item, "Downloading materials...");

  for (const format of item.info.formatList) {
    const format_id = format.format_id;
    const mediaPath = path.join(folder, `${format_id}.${format.ext}`);

    logInfo(`format: ${format_id}`);
    logInfo(`path: ${mediaPath}`);
    if (await fs.pathExists(mediaPath)) {
      logInfo("Path exists, will skip...");
      logInfo(mediaPath);
      continue;
    }

    let cancelFunction = () => {
      downloadProces.cancel();
      fs.remove(mediaPath);
    };

    logInfo("Download Starting");
    let downloadProces = download(
      item.info.opts.url,
      format.format_id,
      mediaPath
    );
    item.eventHandler.onOnceCancel(cancelFunction);
    await downloadProces.promise;
    item.eventHandler.removeCancelListeners();
    item.info.fileList.push(mediaPath);
  }

  item.setStatus(STATUS_KEY, "DOWNLOADED");
}

export function getTempFolder(item: QueueItem) {
  if (item.hasStatus(TEMP_FOLDER)) {
    logInfo("Temp folder exists");
    logInfo(item.getStatus(TEMP_FOLDER));
    return item.getStatus(TEMP_FOLDER);
  }
  logInfo("Making temp folder");
  const folderPath = path.join(item.info.opts.output, `temp-${item.id}`);
  item.setStatus(TEMP_FOLDER, folderPath);
  logInfo(item.getStatus(TEMP_FOLDER));
  return folderPath;
}
