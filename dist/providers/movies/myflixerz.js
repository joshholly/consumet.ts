"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const extractors_1 = require("../../extractors");
class MyFlixerz extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'MyFlixer';
        this.baseUrl = 'https://myflixerz.to';
        this.logo = 'https://myflixerz.to/images/group_1/theme_7/logo.png?v=0.1';
        this.classPath = 'MOVIES.MyFlixerz';
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        /**
         *
         * @param query search query string
         * @param page page number (default 1) (optional)
         */
        this.search = async (query, page = 1) => {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/search/${query.replace(/[\W_]+/g, '-')}?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';
                searchResult.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('.film_list-wrap > div.flw-item').each((i, el) => {
                    var _a;
                    const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                    searchResult.results.push({
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h2 > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        seasons: releaseDate.includes('SS') ? parseInt(releaseDate.split('SS')[1]) : undefined,
                        type: $(el).find('div.film-detail > div.fd-infor > span:nth-child(4)').text() === 'Movie'
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    });
                });
                return searchResult;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param mediaId media link or id
         */
        this.fetchMediaInfo = async (mediaId) => {
            var _a;
            if (!mediaId.startsWith(this.baseUrl)) {
                mediaId = `${this.baseUrl}/${mediaId}`;
            }
            const movieInfo = {
                id: mediaId.split('to/').pop(),
                title: '',
                url: mediaId,
            };
            try {
                const { data } = await this.client.get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                const recommendationsArray = [];
                $('div.container > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item').each((i, el) => {
                    var _a, _b, _c;
                    recommendationsArray.push({
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').text(),
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        duration: (_b = $(el).find('div.film-detail > div.fd-infor > span.fdi-duration').text().replace('m', '')) !== null && _b !== void 0 ? _b : null,
                        type: $(el).find('div.film-detail > div.fd-infor > span.fdi-item').eq(1).text().trim().toLowerCase() ===
                            'tv'
                            ? models_1.TvType.TVSERIES
                            : (_c = models_1.TvType.MOVIE) !== null && _c !== void 0 ? _c : null,
                    });
                });
                const uid = $('.detail_page-watch').attr('data-id');
                movieInfo.cover = (_a = $('.cover_follow').attr('style')) === null || _a === void 0 ? void 0 : _a.slice(22).replace(')', '').replace(';', '');
                movieInfo.title = $('.heading-name > a:nth-child(1)').text();
                movieInfo.image = $('.dp-i-c-poster > div:nth-child(1) > img:nth-child(1)').attr('src');
                movieInfo.description = $('.description')
                    .text()
                    .replace(/^Overview:\s*/i, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                movieInfo.type = movieInfo.id.split('/')[0] === 'tv' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                movieInfo.releaseDate = $('div.row > div.col-xl-5 .row-line')
                    .eq(0)
                    .text()
                    .replace('Released: ', '')
                    .trim();
                movieInfo.genres = $('div.row >div.col-xl-5 .row-line')
                    .eq(1)
                    .find('a')
                    .map((i, el) => $(el).text().split('&'))
                    .get()
                    .map(v => v.trim());
                movieInfo.casts = $('div.row > div.col-xl-5 .row-line')
                    .eq(2)
                    .find('a')
                    .map((i, el) => $(el).text())
                    .get();
                movieInfo.tags = $('div.row-tags > h2')
                    .map((i, el) => $(el).text().replace(/\s+/g, ' ').trim())
                    .get();
                movieInfo.production = $('div.row > div.col-xl-6 .row-line')
                    .eq(2)
                    .find('a')
                    .map((i, el) => $(el).text().trim())
                    .get()
                    .join(', ');
                movieInfo.country = $('div.row > div.col-xl-6 .row-line').eq(1).find('a').text().trim();
                movieInfo.duration = $('div.row > div.col-xl-6 .row-line')
                    .eq(0)
                    .text()
                    .replace('Duration: ', '')
                    .replace(/\s+/g, ' ')
                    .trim();
                movieInfo.rating = parseFloat($('.btn-imdb').text().replace('IMDB: ', '').trim());
                movieInfo.recommendations = recommendationsArray;
                const ajaxReqUrl = (id, type, isSeasons = false) => {
                    if (type === 'tv' && isSeasons) {
                        return `${this.baseUrl}/ajax/season/list/${id}`;
                    }
                    else if (type === 'season') {
                        return `${this.baseUrl}/ajax/season/episodes/${id}`;
                    }
                    else {
                        return `${this.baseUrl}/ajax/${type === 'movie' ? type : `v2/${type}`}/${isSeasons ? 'seasons' : 'episodes'}/${id}`;
                    }
                };
                if (movieInfo.type === models_1.TvType.TVSERIES) {
                    const { data } = await this.client.get(ajaxReqUrl(uid, 'tv', true));
                    const $$ = (0, cheerio_1.load)(data);
                    const seasonsIds = $$('.dropdown-menu > a')
                        .map((i, el) => $(el).attr('data-id'))
                        .get();
                    movieInfo.episodes = [];
                    let season = 1;
                    for (const id of seasonsIds) {
                        const { data } = await this.client.get(ajaxReqUrl(id, 'season'));
                        const $$$ = (0, cheerio_1.load)(data);
                        $$$('ul.nav > li.nav-item > a').each((i, el) => {
                            var _a, _b;
                            const episodeId = $$$(el).attr('data-id');
                            const episodeTitle = $$$(el).attr('title');
                            const episodeNumber = parseInt(((_a = episodeTitle.match(/Eps (\d+):/i)) === null || _a === void 0 ? void 0 : _a[1]) || '0');
                            const episode = {
                                id: episodeId,
                                title: episodeTitle,
                                number: episodeNumber,
                                season: season,
                                url: `${this.baseUrl}/ajax/episode/servers/${episodeId}`,
                            };
                            (_b = movieInfo.episodes) === null || _b === void 0 ? void 0 : _b.push(episode);
                        });
                        season++;
                    }
                }
                return movieInfo;
            }
            catch (err) {
                console.log(err, 'err');
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId episode id
         * @param mediaId media id
         * @param server server type (default `VidCloud`) (optional)
         */
        this.fetchEpisodeSources = async (episodeId, mediaId, server = models_1.StreamingServers.UpCloud) => {
            if (episodeId.startsWith('http')) {
                const serverUrl = new URL(episodeId);
                switch (server) {
                    case models_1.StreamingServers.Voe:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new extractors_1.Voe(this.proxyConfig, this.adapter).extract(serverUrl)),
                        };
                    case models_1.StreamingServers.MegaCloud:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new extractors_1.VidCloud(this.proxyConfig, this.adapter).extract(serverUrl, true)),
                        };
                    case models_1.StreamingServers.UpCloud:
                        return {
                            headers: { Referer: serverUrl.href },
                            ...(await new extractors_1.VidCloud(this.proxyConfig, this.adapter).extract(serverUrl, true)),
                        };
                    default:
                        return {
                            headers: { Referer: serverUrl.href },
                            sources: await new extractors_1.MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
                        };
                }
            }
            try {
                const servers = await this.fetchEpisodeServers(episodeId, mediaId);
                const i = servers.findIndex(s => s.name === server);
                if (i === -1) {
                    throw new Error(`Server ${server} not found`);
                }
                const { data } = await this.client.get(`${this.baseUrl}/ajax/episode/sources/${servers[i].url}`);
                const serverUrl = new URL(data.link);
                return await this.fetchEpisodeSources(serverUrl.href, mediaId, server);
            }
            catch (err) {
                console.log(err, 'err');
                throw new Error(err.message);
            }
        };
        /**
         *
         * @param episodeId takes episode link or movie id
         * @param mediaId takes movie link or id (found on movie info object)
         */
        this.fetchEpisodeServers = async (episodeId, mediaId) => {
            if (!episodeId.startsWith(this.baseUrl + '/ajax') && !mediaId.includes('movie'))
                episodeId = `${this.baseUrl}/ajax/episode/servers/${episodeId}`;
            else
                episodeId = `${this.baseUrl}/ajax/episode/list/${episodeId}`;
            try {
                const { data } = await this.client.get(episodeId);
                const $ = (0, cheerio_1.load)(data);
                const servers = $('.nav > li')
                    .map((i, el) => {
                    const server = {
                        name: mediaId.includes('movie')
                            ? $(el).find('a').find('span').text().trim().toLowerCase()
                            : $(el).find('a').find('span').text().trim().toLowerCase(),
                        url: !mediaId.includes('movie')
                            ? $(el).find('a').attr('data-id') || '' // Fallback to empty string
                            : $(el).find('a').attr('data-linkid') || '', // Fallback to empty string
                    };
                    return server;
                })
                    .get();
                return servers;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchRecentMovies = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const movies = $('section.block_area:contains("Latest Movies") > div:nth-child(2) > div:nth-child(1) > div.flw-item')
                    .map((i, el) => {
                    var _a;
                    const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                    const movie = {
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        rating: $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text() || null,
                        type: models_1.TvType.MOVIE,
                    };
                    return movie;
                })
                    .get();
                return movies;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchRecentTvShows = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const tvshows = $('section.block_area:contains("Latest TV Shows") > div:nth-child(2) > div:nth-child(1) > div.flw-item')
                    .map((i, el) => {
                    var _a;
                    const tvshow = {
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        season: $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[0] || null,
                        latestEpisode: $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[1] || null,
                        type: models_1.TvType.TVSERIES,
                    };
                    return tvshow;
                })
                    .get();
                return tvshows;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchTrendingMovies = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const movies = $('div#trending-movies div.film_list-wrap div.flw-item')
                    .map((i, el) => {
                    var _a;
                    const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                    const movie = {
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
                        rating: $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text() || null,
                        type: models_1.TvType.MOVIE,
                    };
                    return movie;
                })
                    .get();
                return movies;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchTrendingTvShows = async () => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/home`);
                const $ = (0, cheerio_1.load)(data);
                const tvshows = $('div#trending-tv div.film_list-wrap div.flw-item')
                    .map((i, el) => {
                    var _a;
                    const tvshow = {
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1),
                        title: $(el).find('div.film-detail > h3.film-name > a').attr('title'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        season: $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[0] || null,
                        latestEpisode: $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[1] || null,
                        type: models_1.TvType.TVSERIES,
                    };
                    return tvshow;
                })
                    .get();
                return tvshows;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchByCountry = async (country, page = 1) => {
            const result = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';
            try {
                const { data } = await this.client.get(`${this.baseUrl}/country/${country}/?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                result.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('div.container > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item')
                    .each((i, el) => {
                    var _a, _b, _c, _d, _e, _f;
                    const resultItem = {
                        id: (_b = (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : '',
                        title: (_c = $(el).find('div.film-detail > h2.film-name > a').attr('title')) !== null && _c !== void 0 ? _c : '',
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        type: ((_d = $(el).find('div.film-poster > a').attr('href')) === null || _d === void 0 ? void 0 : _d.slice(1).split('/')[0].toLowerCase()) === 'movie'
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    };
                    const season = (_e = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[0]) !== null && _e !== void 0 ? _e : null;
                    const latestEpisode = (_f = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[1]) !== null && _f !== void 0 ? _f : null;
                    if (resultItem.type === models_1.TvType.TVSERIES) {
                        resultItem.season = season;
                        resultItem.latestEpisode = latestEpisode;
                    }
                    else {
                        resultItem.rating = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                        resultItem.releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                    }
                    result.results.push(resultItem);
                })
                    .get();
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchByGenre = async (genre, page = 1) => {
            const result = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = await this.client.get(`${this.baseUrl}/genre/${genre}?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';
                result.hasNextPage =
                    $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;
                $('.film_list-wrap > div.flw-item')
                    .each((i, el) => {
                    var _a, _b, _c, _d, _e, _f;
                    const resultItem = {
                        id: (_b = (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : '',
                        title: (_c = $(el).find('div.film-detail > h2.film-name > a').attr('title')) !== null && _c !== void 0 ? _c : '',
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        type: ((_d = $(el).find('div.film-poster > a').attr('href')) === null || _d === void 0 ? void 0 : _d.slice(1).split('/')[0].toLowerCase()) === 'movie'
                            ? models_1.TvType.MOVIE
                            : models_1.TvType.TVSERIES,
                    };
                    const season = (_e = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[0]) !== null && _e !== void 0 ? _e : null;
                    const latestEpisode = (_f = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[1]) !== null && _f !== void 0 ? _f : null;
                    if (resultItem.type === models_1.TvType.TVSERIES) {
                        resultItem.season = season;
                        resultItem.latestEpisode = latestEpisode;
                    }
                    else {
                        resultItem.rating = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
                        resultItem.releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
                    }
                    result.results.push(resultItem);
                })
                    .get();
                return result;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
exports.default = MyFlixerz;
//# sourceMappingURL=myflixerz.js.map