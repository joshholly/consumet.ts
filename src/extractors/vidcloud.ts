import { VideoExtractor, IVideo, ISubtitle, Intro } from '../models';
import { USER_AGENT } from '../utils';


class VidCloud extends VideoExtractor {
  protected override serverName = 'VidCloud';
  protected override sources: IVideo[] = [];

  override extract = async (
    videoUrl: URL,
    _?: boolean
  ): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    const result: { sources: IVideo[]; subtitles: ISubtitle[]; intro?: Intro } = {
      sources: [],
      subtitles: [],
    };
    try {
      const id = videoUrl.href.split('/').pop()?.split('?')[0];
      const options = {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Referer: videoUrl.href,
          'User-Agent': USER_AGENT,
        },
      };

      // Get the domain from the URL
      const fullUrl = new URL(videoUrl.href);
      const domain = fullUrl.hostname;
      
      // Get the token from environment variables
      const token = env.MEGACLOUD_TOKEN;
      if (!token) {
        throw new Error('MEGACLOUD_TOKEN is not defined in environment variables');
      }
      
      let serverId;
      if(_ === true) {
        serverId = '0'
      }
      else {
        serverId = '1'
      }

      // Use fetch to make the HTTP GET request to WHVX megacloud API
      const reqUrl = `https://megacloud.whvx.net/fetch?id=${id}&host=${domain}&serverId=${serverId}&token=${token}`;
      const response = await fetch(reqUrl);
      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response
      const res = await response.json();
      const sources = res.sources;

      this.sources = sources.map((s: any) => ({
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
          .filter((line: string) => line.includes('.m3u8') || line.endsWith('m3u8')) as string[];
        const qualities = data.split('\n').filter((line: string) => line.includes('RESOLUTION=')) as string[];

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

      result.subtitles = res.tracks.map((s: any) => ({
        url: s.file,
        lang: s.label ? s.label : 'Default (maybe)',
      }));

      return result;
    } catch (err) {
      throw err;
    }
  };
}

export default VidCloud;
