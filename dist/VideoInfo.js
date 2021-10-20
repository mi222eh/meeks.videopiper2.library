"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoInfo = exports.VideoInfo = exports.FormatEnum = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const InvokeManager_1 = require("./InvokeManager");
// declare const format = "4K" | "1080p" | "720p" | "480p" | "360p"
var FormatEnum;
(function (FormatEnum) {
    FormatEnum["4K60"] = "4k60";
    FormatEnum["4K"] = "4k";
    FormatEnum["1080p60"] = "1080p60";
    FormatEnum["1080p"] = "1080p";
    FormatEnum["720p60"] = "720p";
    FormatEnum["720p"] = "720p";
    FormatEnum["480p"] = "480p";
    FormatEnum["360p"] = "360p";
    FormatEnum["audio"] = "audio";
})(FormatEnum = exports.FormatEnum || (exports.FormatEnum = {}));
class VideoInfo {
    constructor(info) {
        this.info = info;
    }
    getThumbnailPicture() {
        return this.info.thumbnail;
    }
    getTitle() {
        return this.info.title;
    }
    getVideoFormats() {
        const formatList = this.info.formats.filter((x) => x.vcodec !== "none");
        return lodash_1.default.sortBy(formatList, (x) => x.filesize);
    }
    getAudioFormats() {
        const formatList = this.info.formats.filter((x) => x.vcodec === "none" && x.acodec !== "none");
        return formatList;
    }
    getBestAudioFormat() {
        const formatList = this.getAudioFormats().sort((a, b) => a.filesize - b.filesize);
        return formatList[0];
    }
    get getFormat() {
        const that = this;
        return {
            ["4K60"]() {
                const formatList = that.getVideoFormats();
                let filteredFormatList = lodash_1.default.filter(formatList, (format) => format.width >= 3840 && format.width <= 4096 && format.fps >= 60);
                filteredFormatList = lodash_1.default.sortBy(filteredFormatList, (a) => a.filesize);
                const format = lodash_1.default.last(filteredFormatList);
                return format;
            },
            ["4K"]() {
                const formatList = that.getVideoFormats();
                let filteredFormatList = lodash_1.default.filter(formatList, (format) => format.width >= 3840 && format.width <= 4096 && format.fps < 60);
                filteredFormatList = lodash_1.default.sortBy(filteredFormatList, (a) => a.filesize);
                const format = lodash_1.default.last(filteredFormatList);
                return format;
            },
            ["1080p60"]() {
                const formatList = that.getVideoFormats();
                const format = lodash_1.default.findLast(formatList, (x) => x.width === 1920 && x.fps >= 60);
                return format;
            },
            ["1080p"]() {
                const formatList = that.getVideoFormats();
                const format = lodash_1.default.findLast(formatList, (x) => x.width === 1920 && x.fps < 60);
                return format;
            },
            ["720p60"]() {
                const formatList = that.getVideoFormats();
                const format = lodash_1.default.findLast(formatList, (x) => x.height > 700 && x.height < 800 && x.fps >= 60);
                return format;
            },
            ["720p"]() {
                const formatList = that.getVideoFormats();
                const format = lodash_1.default.findLast(formatList, (x) => x.height > 700 && x.height < 800 && x.fps < 60);
                return format;
            },
            ["480p"]() {
                const formatList = that.getVideoFormats();
                const format = lodash_1.default.findLast(formatList, (x) => x.height > 400 && x.height < 500);
                return format;
            },
            ["360p"]() {
                const formatList = that.getVideoFormats();
                const format = lodash_1.default.findLast(formatList, (x) => x.height > 300 && x.height < 400);
                return format;
            },
            audio() {
                return that.getBestAudioFormat();
            },
        };
    }
}
exports.VideoInfo = VideoInfo;
async function getVideoInfo(url) {
    const info = await InvokeManager_1.getInfo(url).promise;
    return new VideoInfo(info);
}
exports.getVideoInfo = getVideoInfo;
