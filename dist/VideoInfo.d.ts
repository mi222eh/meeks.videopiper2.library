import * as youtubedl from "youtube-dl-dal";
export declare enum FormatEnum {
    "4K60" = "4k60",
    "4K" = "4k",
    "1080p60" = "1080p60",
    "1080p" = "1080p",
    "720p60" = "720p",
    "720p" = "720p",
    "480p" = "480p",
    "360p" = "360p",
    "audio" = "audio"
}
export declare class VideoInfo {
    info: youtubedl.VideoInfo.IVideoInfo;
    constructor(info: youtubedl.VideoInfo.IVideoInfo);
    getThumbnailPicture(): string;
    getTitle(): string;
    getVideoFormats(): youtubedl.VideoInfo.Format[];
    getAudioFormats(): youtubedl.VideoInfo.Format[];
    getBestAudioFormat(): youtubedl.VideoInfo.Format;
    get getFormat(): {
        [key in keyof typeof FormatEnum]: () => youtubedl.VideoInfo.Format;
    };
}
export declare function getVideoInfo(url: string): Promise<VideoInfo>;
export interface SelectFormatObj {
    maxHeight?: number;
    maxWidth?: number;
    maxFps?: number;
    onlyAudio?: boolean;
}
