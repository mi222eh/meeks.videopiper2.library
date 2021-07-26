/// <reference types="node" />
import { FormatEnum } from ".";
import Events from "events";
import { Format } from "meeks.nodejs.youtube-dl/dist/videoinfo";
/** This is the queue that all of the items will be */
export declare let Queue: QueueItem[];
/**Will return the count of items that are in progress */
export declare function getInProgressCount(): number;
/** Gets a list of items that are ready to go */
export declare function getReadyList(): QueueItem[];
/** Gets the next id for an item */
export declare function getNextId(): number;
/**adds an item to the list */
export declare function add(item: QueueItem): void;
/** gets the number of items that are in the queue */
export declare function getQueueCount(): number;
declare class VideoEvents extends Events {
    onOnceCancel(fn: () => void): void;
    removeCancelListeners(): void;
    fireCancel(): void;
}
interface QueueItemOpts {
    choice: keyof typeof FormatEnum;
    url: string;
    output: string;
}
interface QueueItemInfo {
    opts: QueueItemOpts;
    fileList: string[];
    formatList: Format[];
    statusMap: {
        [key: string]: any;
    };
    statusText: string;
    thumbnailUrl: string;
    title: string;
}
export declare class QueueItem {
    info: QueueItemInfo;
    eventHandler: VideoEvents;
    isReady: boolean;
    isStopped: boolean;
    isInProgress: boolean;
    isFinished: boolean;
    id: number;
    setStatus(key: string, value: string): void;
    getStatus(key: string): string;
    hasStatus(key: string): boolean;
    getStatusMap(): Map<any, any>;
    setStatusMap(map: Map<string, any>): Map<string, any>;
    /** Stop the execution of this item */
    Cancel(): void;
    /** Resumes the execution of this item */
    Resume(): void;
    /** Removes this item from the queue */
    Remove(): void;
}
export declare function removeItem(id: number): void;
export declare function addVideoItem(opts: QueueItemOpts): void;
export {};
