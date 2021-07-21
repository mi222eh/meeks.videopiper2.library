import { IVideoInfo } from "youtube-dl-dal/dist/videoinfo";
export declare class InvokeManager<T> {
    channel: string;
    key: string;
    promise: Promise<T>;
    constructor(channel: string);
    call(...args: any[]): Promise<any>;
    cancel(): void;
}
export declare function getInfo(url: string): InvokeManager<IVideoInfo>;
export declare function download(url: string, format: string, path: string): InvokeManager<unknown>;
export declare function convert(src: string, output: string): InvokeManager<unknown>;
export declare function combine(srcList: string[], output: string): InvokeManager<unknown>;
