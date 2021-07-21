import * as youtubedl from "youtube-dl-dal";
import _ from "lodash";
import { getInfo, InvokeManager } from "./InvokeManager";

// declare const format = "4K" | "1080p" | "720p" | "480p" | "360p"
export enum FormatEnum {
  "4K60" = "4k60",
  "4K" = "4k",
  "1080p60" = "1080p60",
  "1080p" = "1080p",
  "720p60" = "720p",
  "720p" = "720p",
  "480p" = "480p",
  "360p" = "360p",
  "audio" = "audio",
}
export class VideoInfo {
  constructor(public info: youtubedl.VideoInfo.IVideoInfo) {}

  getThumbnailPicture() {
    return this.info.thumbnail;
  }
  getTitle() {
    return this.info.title;
  }
  getVideoFormats() {
    const formatList = this.info.formats.filter(
      (x) => x.vcodec.toLowerCase() !== "none"
    );
    return _.sortBy(formatList, (x) => x.filesize);
  }
  getAudioFormats() {
    const formatList = this.info.formats.filter(
      (x) => x.vcodec.toLowerCase() === "none" && x.acodec !== 'none'
    );
    return formatList;
  }
  getBestAudioFormat() {
    const formatList = this.getAudioFormats().sort(
      (a, b) => a.filesize - b.filesize
    );
    return formatList[0];
  }

  get getFormat(): {
    [key in keyof typeof FormatEnum]: () => youtubedl.VideoInfo.Format;
  } {
    const that = this;
    return {
      ["4K60"]() {
        const formatList = that.getVideoFormats();
        let filteredFormatList = _.filter(
          formatList,
          (format) => format.width >= 3840 && format.width <= 4096 && format.fps >= 60
        );
        filteredFormatList = _.sortBy(filteredFormatList, (a) => a.filesize);
        const format = _.last(filteredFormatList);
        return format;
      },
      ["4K"]() {
        const formatList = that.getVideoFormats();
        let filteredFormatList = _.filter(
          formatList,
          (format) => format.width >= 3840 && format.width <= 4096 && format.fps < 60
        );
        filteredFormatList = _.sortBy(filteredFormatList, (a) => a.filesize);
        const format = _.last(filteredFormatList);
        return format;
      },
      ["1080p60"]() {
        const formatList = that.getVideoFormats();

        const format = _.findLast(formatList, (x) => x.width === 1920 && x.fps >= 60);
        return format;
      },
      ["1080p"]() {
        const formatList = that.getVideoFormats();

        const format = _.findLast(formatList, (x) => x.width === 1920  && x.fps < 60);
        return format;
      },
      ["720p60"]() {
        const formatList = that.getVideoFormats();

        const format = _.findLast(
          formatList,
          (x) => x.height > 700 && x.height < 800 && x.fps >= 60
        );
        return format;
      },
      ["720p"]() {
        const formatList = that.getVideoFormats();

        const format = _.findLast(
          formatList,
          (x) => x.height > 700 && x.height < 800 && x.fps < 60
        );
        return format;
      },
      ["480p"]() {
        const formatList = that.getVideoFormats();
        const format = _.findLast(
          formatList,
          (x) => x.height > 400 && x.height < 500
        );
        return format;
      },
      ["360p"]() {
        const formatList = that.getVideoFormats();
        const format = _.findLast(
          formatList,
          (x) => x.height > 300 && x.height < 400
        );
        return format;
      },
      audio() {
        return that.getBestAudioFormat();
      },
    };
  }
}

export async function getVideoInfo(url: string) {
  const info = await getInfo(url).promise;
  return new VideoInfo(info);
}

export interface SelectFormatObj {
  maxHeight?: number;
  maxWidth?: number;
  maxFps?: number;
  onlyAudio?: boolean;
}
