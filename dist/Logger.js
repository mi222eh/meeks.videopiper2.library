"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logWarning = exports.logInfo = void 0;
const tslib_1 = require("tslib");
const electron_1 = tslib_1.__importDefault(require("electron"));
function logInfo(message) {
    electron_1.default.ipcRenderer.invoke('log/info', message);
}
exports.logInfo = logInfo;
function logWarning(message) {
    electron_1.default.ipcRenderer.invoke('log/warn', message);
}
exports.logWarning = logWarning;
function logError(message) {
    electron_1.default.ipcRenderer.invoke('log/error', message);
}
exports.logError = logError;
