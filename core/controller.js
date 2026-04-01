import { getLiveChatId } from "./youtube/youtubeApi.js";
import { fetchLiveMessages } from "./youtube/liveChat.js";
import { sendMessage } from "./telegram/telegramApi.js";
import { spinWheel } from "./wheel.js";
import { CONFIG } from "../config/config.js";

const participants = new Set();

export async function startLiveSystem(videoId) {
  try {
    const liveChatId = await getLiveChatId(videoId);

    if (!liveChatId) {
      console.error("❌ No Live Chat Found");
      return;
    }

    console.log("✅ Live Chat Connected:", liveChatId);

    setInterval(async () => {
      try {
        const messages = await fetchLiveMessages(liveChatId);

        messages.forEach(msg => {
          if (msg.message.toLowerCase().includes(CONFIG.KEYWORD)) {
            participants.add(msg.user);
          }
        });

        console.log("👥 Participants:", [...participants]);

      } catch (err) {
        console.error("Polling error:", err);
      }
    }, CONFIG.POLL_INTERVAL);

  } catch (err) {
    console.error("Startup error:", err);
  }
}

export function runSpin() {
  const entries = [...participants];

  if (entries.length === 0) {
    console.log("❌ No participants");
    return;
  }

  const winner = spinWheel(entries);

  sendMessage(`🎉 LIVE WINNER: ${winner}`);
}