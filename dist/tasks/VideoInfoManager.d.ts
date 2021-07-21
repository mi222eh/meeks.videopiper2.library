import { QueueItem } from "../QueueManager";
export declare function ResolveFormatList(item: QueueItem): Promise<void>;
export declare function GetMediaTitle(item: QueueItem): string;
export declare function GetMediaThumbnail(item: QueueItem): string;
export declare function setStatusText(item: QueueItem, statusText: string): void;
