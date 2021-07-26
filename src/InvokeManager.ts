import { ipcRenderer } from "electron";
import * as lodash from "lodash";
import { IVideoInfo } from "meeks.nodejs.youtube-dl/dist/videoinfo";

export class InvokeManager<T> {
  key = lodash.uniqueId("invoke");
  promise: Promise<T>;
  constructor(public channel: string) {}
  async call(...args) {
    const response = await Promise.resolve(
      ipcRenderer.invoke(this.channel, {
        __key: this.key,
        __payload: args,
      })
    );

    return response;
  }
  cancel() {
    ipcRenderer.send(`${this.key}/cancel`);
  }
}

export function getInfo(url: string) {
  const manager = new InvokeManager<IVideoInfo>("media/getInfo");
  manager.promise = manager.call(url);
  return manager;
}

export function download(url: string, format: string, path: string) {
  const manager = new InvokeManager("media/download");
  manager.promise = manager.call(url, format, path);
  return manager;
}

export function convert(src: string, output: string) {
  const manager = new InvokeManager("media/convert");
  manager.promise = manager.call(src, output);
  return manager;
}

export function combine(srcList: string[], output: string) {
  const manager = new InvokeManager("media/combine");
  manager.promise = manager.call(srcList, output);
  return manager;
}
