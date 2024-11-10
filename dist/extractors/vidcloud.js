"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const utils_1 = require("../utils");
class VidCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VidCloud';
        this.sources = [];
        this.extract = async (videoUrl, _) => {
            var _a;
            const result = {
                sources: [],
                subtitles: [],
            };
            try {
                const id = (_a = videoUrl.href.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0];
                const options = {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Referer: videoUrl.href,
                        'User-Agent': utils_1.USER_AGENT,
                    },
                };

                // Get the domain from the URL
                const fullUrl = new URL(videoUrl.href);
                const domain = fullUrl.hostname;

                // Get the token from environment variables
                const token = process.env.MEGACLOUD_TOKEN;
                if (!token) {
                    throw new Error('MEGACLOUD_TOKEN is not defined in environment variables');
                }

                // Use fetch to make the HTTP GET request to WHVX megacloud API
                const reqUrl = `https://megacloud.whvx.net/fetch?id=${id}&host=${domain}&serverId=1&token=${token}`;
                const response = await fetch(reqUrl);

                // Check if the response is ok (status code 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Parse the JSON response
                const res = await response.json();

                const sources = res.sources;
                this.sources = sources.map((s) => ({
                    url: s.file,
                    isM3U8: s.file.includes('.m3u8') || s.file.endsWith('m3u8'),
                }));
                result.sources.push(...this.sources);
                result.sources = [];
                this.sources = [];
                for (const source of sources) {
                    const { data } = await this.client.get(source.file, options);
                    const urls = data
                        .split('\n')
                        .filter((line) => line.includes('.m3u8') || line.endsWith('m3u8'));
                    const qualities = data.split('\n').filter((line) => line.includes('RESOLUTION='));
                    const TdArray = qualities.map((s, i) => {
                        const f1 = s.split('x')[1];
                        const f2 = urls[i];
                        return [f1, f2];
                    });
                    for (const [f1, f2] of TdArray) {
                        this.sources.push({
                            url: f2,
                            quality: f1,
                            isM3U8: f2.includes('.m3u8') || f2.endsWith('m3u8'),
                        });
                    }
                    result.sources.push(...this.sources);
                }
                result.sources.push({
                    url: sources[0].file,
                    isM3U8: sources[0].file.includes('.m3u8') || sources[0].file.endsWith('m3u8'),
                    quality: 'auto',
                });
                result.subtitles = res.tracks.map((s) => ({
                    url: s.file,
                    lang: s.label ? s.label : 'Default (maybe)',
                }));
                return result;
            }
            catch (err) {
                throw err;
            }
        };
    }
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map
