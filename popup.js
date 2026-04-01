document.addEventListener("DOMContentLoaded", () => {

  let data = [];

  document.getElementById("draw").onclick = async () => {
    if (!data || data.length === 0) {
      document.getElementById("result").innerText = "No valid names!";
      return;
    }

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let count = parseInt(document.getElementById("count").value) || 1;

    if (count > data.length) {
      document.getElementById("result").innerText = "Not enough entries!";
      return;
    }

    let shuffled = [...data].sort(() => 0.5 - Math.random());
    let winners = shuffled.slice(0, count);

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [winners],
      func: (winners) => {
        document.querySelectorAll(".lucky-highlight").forEach(el => {
          el.style.backgroundColor = "";
          el.style.color = "";
          el.classList.remove("lucky-highlight");
        });

        let elements = document.querySelectorAll("li, p, span, td");

        elements.forEach(el => {
          let text = el.innerText.trim();

          if (winners.includes(text)) {
            el.style.backgroundColor = "yellow";
            el.style.color = "black";
            el.classList.add("lucky-highlight");
          }
        });
      }
    });

    document.getElementById("result").innerHTML =
      "🎉 Winners:<br><br>" +
      winners.map((w, i) => `${i + 1}. ${w}`).join("<br>");
  };

});
document.getElementById("startBtn").addEventListener("click", () => {
  const videoId = prompt("Enter YouTube Live Video ID:");

  chrome.runtime.sendMessage({
    type: "START",
    videoId
  });
});

document.getElementById("spinBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "SPIN"
  });
});