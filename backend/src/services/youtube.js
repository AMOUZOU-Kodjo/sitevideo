const https = require('https');
const { XMLParser } = require('fast-xml-parser');

const CHANNEL_ID = 'UCjyDO66xLyJN8lMEE8r5skA';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const fetchUrl = (url) => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(data));
  }).on('error', reject);
});

exports.getLatestVideos = async (limit = 5) => {
  const xml = await fetchUrl(RSS_URL);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const json = parser.parse(xml);

  const entries = json.feed?.entry;
  if (!entries) return [];

  const list = Array.isArray(entries) ? entries : [entries];
  return list.slice(0, limit).map(entry => ({
    id: entry['yt:videoId'],
    title: entry.title,
    url: entry.link?.['@_href'] || `https://www.youtube.com/watch?v=${entry['yt:videoId']}`,
    thumbnail: entry['media:group']?.['media:thumbnail']?.['@_url']?.replace('hqdefault', 'mqdefault') || `https://i.ytimg.com/vi/${entry['yt:videoId']}/mqdefault.jpg`,
    published: entry.published,
    updated: entry.updated,
    views: parseInt(entry['media:group']?.['media:community']?.['media:statistics']?.['@_views'] || 0)
  }));
};

exports.getChannelInfo = async () => {
  const xml = await fetchUrl(RSS_URL);
  const parser = new XMLParser();
  const json = parser.parse(xml);

  let avatar = '';
  try {
    const html = await fetchUrl(`https://www.youtube.com/@${encodeURIComponent(json.feed?.title || 'CodeAvecKodjo')}`);
    const m = html.match(/"avatar":\{"thumbnails":\[{"url":"([^"]+)/);
    if (m) avatar = m[1].replace(/\\u0026/g, '&');
  } catch {}

  return {
    name: json.feed?.title || 'Code avec Kodjo',
    url: json.feed?.link?.['@_href'] || `https://www.youtube.com/channel/${CHANNEL_ID}`,
    channelId: CHANNEL_ID,
    avatar,
    banner: 'https://yt3.ggpht.com/5qbzYycq3VIVxm0zU83Tu9nxR5iDLYJwaqznRfMG99O7WbuOQTLVrY_IZrPgOzkVq5p84trKsA=s600-c-k-c0x00ffffff-no-rj-rp-mo'
  };
};

exports.checkLiveStatus = () => {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/channel/${CHANNEL_ID}/live`;
    https.get(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const isLive = data.includes('"isLive":true') || data.includes('isLiveNow');
        resolve(isLive);
      });
    }).on('error', () => resolve(false));
  });
};
