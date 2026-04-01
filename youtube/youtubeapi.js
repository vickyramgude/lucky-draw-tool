import { CONFIG } from "../config/config.js";

export async function getLiveChatId(videoId) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${CONFIG.YOUTUBE_API_KEY}`
  );

  const data = await res.json();

  return data.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
}