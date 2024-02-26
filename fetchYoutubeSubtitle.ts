import fetch from "node-fetch";
export const SUBTITLE_DOWNLOADER_URL = "https://savesubs.com";

// 定义期望的JSON结构
interface YoutubeSubtitleResponse {
  response: {
    title?: string;
    formats?: any[]; // 你可以根据实际情况替换any为更具体的类型
  };
}

// https://savesubs.com/action/extract
export async function fetchYoutubeSubtitleUrls(videoId: string) {
  const response = await fetch(SUBTITLE_DOWNLOADER_URL + "/action/extract", {
    method: "POST",
    body: JSON.stringify({
      data: { url: `https://www.youtube.com/watch?v=${videoId}` },
    }),
    headers: {
      "Content-Type": "text/plain",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      "X-Auth-Token":
        `${process.env.SAVESUBS_X_AUTH_TOKEN}` ||
        "1cbcl9XWl9Zlx9Kky8drmJloyWzGyJ2Yw5prm2rKmJndlXyDrXTQgdquun/YxHy2hra1kMWueop9",
      "X-Requested-Domain": "savesubs.com",
      "X-Requested-With": "xmlhttprequest",
    },
  });
  const tempJson = (await response.json()) as YoutubeSubtitleResponse;
  const json = tempJson?.response;
  console.log("========json========", json);
  /*
  * "title": "Microsoft vs Google: AI War Explained | tech",
    "duration": "13 minutes and 15 seconds",
    "duration_raw": "795",
    "uploader": "Joma Tech / 2023-02-20",
    "thumbnail": "//i.ytimg.com/vi/BdHaeczStRA/mqdefault.jpg",
  * */
  return { title: json.title, subtitleList: json.formats };
}
