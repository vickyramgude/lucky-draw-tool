import { CONFIG } from "../config/config.js";

export async function fetchLiveMessages(liveChatId) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&key=${CONFIG.YOUTUBE_API_KEY}`
  );

  const data = await res.json();

  return data.items.map(item => ({
    user: item.authorDetails.displayName,
    message: item.snippet.displayMessage
  }));
}