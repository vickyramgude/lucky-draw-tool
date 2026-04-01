import { startLiveSystem, runSpin } from "./core/controller.js";

// 🔴 Replace with your video ID
const VIDEO_ID = "YOUR_VIDEO_ID";

startLiveSystem(VIDEO_ID);

// Manual trigger (you can connect to button later)
setTimeout(() => {
  runSpin();
}, 30000); // spin after 30 sec