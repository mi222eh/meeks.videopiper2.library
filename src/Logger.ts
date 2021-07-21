import electron from "electron";


export function logInfo(message:string){
    electron.ipcRenderer.invoke('log/info', message);
}

export function logWarning(message:string){
    electron.ipcRenderer.invoke('log/warn', message);
}

export function logError(message:string){
    electron.ipcRenderer.invoke('log/error', message);
}