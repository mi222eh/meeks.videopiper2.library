"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combine = exports.convert = exports.download = exports.getInfo = exports.InvokeManager = void 0;
const tslib_1 = require("tslib");
const electron_1 = require("electron");
const lodash = tslib_1.__importStar(require("lodash"));
class InvokeManager {
    constructor(channel) {
        this.channel = channel;
        this.key = lodash.uniqueId("invoke");
    }
    async call(...args) {
        const response = await Promise.resolve(electron_1.ipcRenderer.invoke(this.channel, {
            __key: this.key,
            __payload: args,
        }));
        return response;
    }
    cancel() {
        electron_1.ipcRenderer.send(`${this.key}/cancel`);
    }
}
exports.InvokeManager = InvokeManager;
function getInfo(url) {
    const manager = new InvokeManager("media/getInfo");
    manager.promise = manager.call(url);
    return manager;
}
exports.getInfo = getInfo;
function download(url, format, path) {
    const manager = new InvokeManager("media/download");
    manager.promise = manager.call(url, format, path);
    return manager;
}
exports.download = download;
function convert(src, output) {
    const manager = new InvokeManager("media/convert");
    manager.promise = manager.call(src, output);
    return manager;
}
exports.convert = convert;
function combine(srcList, output) {
    const manager = new InvokeManager("media/combine");
    manager.promise = manager.call(srcList, output);
    return manager;
}
exports.combine = combine;
