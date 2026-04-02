console.log("CONTENT SCRIPT LOADED 🚀");
if (document.getElementById("ld-panel")) {
  console.log("Already loaded ❌");
  return;
}

// Create panel
let panel = document.createElement("div");
panel.id = "ld-panel"; 

panel.style.position = "fixed";
panel.style.bottom = "20px";
panel.style.right = "20px";
panel.style.width = "260px";
panel.style.background = "rgba(255, 255, 255, 0.15)";
panel.style.backdropFilter = "blur(12px)";
panel.style.border = "1px solid rgba(255,255,255,0.3)";
panel.style.borderRadius = "16px";
panel.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
panel.style.zIndex = "9999";
panel.style.fontFamily = "Arial";
panel.style.overflow = "hidden";

// UI
panel.innerHTML = `
  <div id="ld-header" style="
    background: linear-gradient(135deg, #4CAF50, #2e7d32);
    color: white;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    border-radius: 16px 16px 0 0;
    cursor: move;
  ">
    <span>🎯 Lucky Draw</span>
    <span id="ld-toggle">−</span>
  </div>

  <div id="ld-body" style="padding:12px;">

    <label style="font-size:12px;">Number of Winners</label>
    <input id="ld-count" type="number" value="1" min="1"
      style="
        width:100%;
        padding:8px;
        margin-top:5px;
        margin-bottom:8px;
        border-radius:8px;
        border:none;
        outline:none;
      "
    />

    <button id="ld-scan" class="ld-btn green">Scan</button>
    <button id="ld-draw" class="ld-btn blue">Draw</button>
    <button id="ld-copy" class="ld-btn orange">Copy Winners</button>
    <button id="ld-select" class="ld-btn purple">Select Area</button>

    <div id="ld-result" style="
      margin-top:10px;
      font-size:12px;
      max-height:100px;
      overflow:auto;
    "></div>

  </div>
`;

// Button styles (clean reuse , CSS)
let style = document.createElement("style");
style.innerHTML = `

@keyframes ld-glow {
  0% {
    border-color: #4CAF50;
    box-shadow: 0 0 5px #4CAF50;
  }
  50% {
    border-color: #81C784;
    box-shadow: 0 0 15px #81C784;
  }
  100% {
    border-color: #4CAF50;
    box-shadow: 0 0 5px #4CAF50;
  }
}

.ld-glow-box {
  animation: ld-glow 1s infinite;
}

.ld-preview {
  outline: 2px solid #4CAF50;
  background: rgba(76,175,80,0.15);
}
.ld-btn {
  width:100%;
  padding:8px;
  margin-top:5px;
  border:none;
  border-radius:8px;
  color:white;
  cursor:pointer;
  transition:0.2s;
}

.ld-btn:hover {
  transform: scale(1.05);
}

.green { background:linear-gradient(135deg,#4CAF50,#66bb6a); }
.blue { background:linear-gradient(135deg,#2196F3,#64b5f6); }
.orange { background:linear-gradient(135deg,#ff9800,#ffb74d); }
.purple { background:linear-gradient(135deg,#9c27b0,#ba68c8); }
`;
document.head.appendChild(style);

document.body.appendChild(panel);

// Elements
let scanBtn = panel.querySelector("#ld-scan");
let drawBtn = panel.querySelector("#ld-draw");
let copyBtn = panel.querySelector("#ld-copy");
let resultBox = panel.querySelector("#ld-result");
let header = panel.querySelector("#ld-header");
let toggle = panel.querySelector("#ld-toggle");
let body = panel.querySelector("#ld-body");
let selectBtn = panel.querySelector("#ld-select");

let data = [];
let winners = [];

// SCAN
scanBtn.onclick = () => {
  let elements = document.querySelectorAll("li, p, span, td");

  let raw = Array.from(elements)
    .map(el => el.innerText.trim())
    .filter(text =>
      text.length > 2 &&
      text.length < 40 &&
      /^[a-zA-Z0-9\s._-]+$/.test(text)
    );

  data = [...new Set(raw)];

  resultBox.innerText = `Found ${data.length} entries`;
};

// SHUFFLE
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// DRAW WITH ANIMATION
drawBtn.onclick = () => {
  if (data.length === 0) {
    resultBox.innerText = "No data!";
    return;
  }

  let count = parseInt(panel.querySelector("#ld-count").value) || 1;

  if (count > data.length) {
    resultBox.innerText = "Not enough entries!";
    return;
  }

  let shuffled = shuffleArray([...data]);

  let spins = 15;
  let speed = 80;
  let i = 0;

  let interval = setInterval(() => {
    let random = shuffled[Math.floor(Math.random() * shuffled.length)];
    resultBox.innerText = "🎲 " + random;

    i++;

    if (i >= spins) {
      clearInterval(interval);

      winners = shuffled.slice(0, count);
      if (typeof showWinnerPopup === "function") {
  showWinnerPopup(winners);
}

      document.querySelectorAll(".ld-highlight").forEach(el => {
        el.style.backgroundColor = "";
        el.classList.remove("ld-highlight");
      });

      document.querySelectorAll("li, p, span, td").forEach(el => {
        if (winners.includes(el.innerText.trim())) {
          el.style.backgroundColor = "yellow";
          el.classList.add("ld-highlight");
        }
      });

      resultBox.innerHTML =
        "🎉 Winners:<br><br>" +
        winners.map((w, i) => `${i + 1}. ${w}`).join("<br>");
    }

  }, speed);
};

// COPY
copyBtn.onclick = () => {
  if (winners.length === 0) {
    resultBox.innerText = "No winners!";
    return;
  }

  navigator.clipboard.writeText(winners.join("\n"))
    .then(() => resultBox.innerText = "📋 Copied!")
    .catch(() => resultBox.innerText = "Copy failed!");
};

// TOGGLE
toggle.onclick = () => {
  body.style.display = body.style.display === "none" ? "block" : "none";
};

// DRAG
let isDragging = false;
let offsetX, offsetY;

header.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - panel.offsetLeft;
  offsetY = e.clientY - panel.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    panel.style.left = (e.clientX - offsetX) + "px";
    panel.style.top = (e.clientY - offsetY) + "px";
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Selection 

let selectionBox = null;
let startX, startY;

selectBtn.onclick = () => {
  resultBox.innerText = "🖱️ Drag to select area";
  document.body.style.cursor = "crosshair";

  const onMouseDown = (e) => {
    startX = e.clientX;
    startY = e.clientY;

    selectionBox = document.createElement("div");
    selectionBox.classList.add("ld-glow-box");

    selectionBox = document.createElement("div");

selectionBox.style.position = "fixed";
selectionBox.style.border = "2px solid #4CAF50";
selectionBox.style.background = "rgba(76,175,80,0.15)";
selectionBox.style.borderRadius = "6px";
selectionBox.style.zIndex = "99999";
selectionBox.style.pointerEvents = "none";

let glowStyle = document.createElement("style");
glowStyle.innerHTML = `
@keyframes ldPulse {
  0% { box-shadow: 0 0 5px #4CAF50; }
  50% { box-shadow: 0 0 25px #00ffcc; }
  100% { box-shadow: 0 0 5px #4CAF50; }
}
`;
document.head.appendChild(glowStyle);

// 🔥 FORCE GLOW (no CSS needed)
selectionBox.style.boxShadow = "0 0 20px #4CAF50";
selectionBox.style.animation = "ldPulse 1s infinite";

    document.body.appendChild(selectionBox);

    const onMouseMove = (e) => {
      let currentX = e.clientX;
      let currentY = e.clientY;

      let x = Math.min(startX, currentX);
      let y = Math.min(startY, currentY);
      let width = Math.abs(currentX - startX);
      let height = Math.abs(currentY - startY);

      selectionBox.style.left = x + "px";
      selectionBox.style.top = y + "px";
      selectionBox.style.width = width + "px";
      selectionBox.style.height = height + "px";

      let rect = selectionBox.getBoundingClientRect();

      // remove old highlights
      document.querySelectorAll(".ld-preview").forEach(el => {
        el.classList.remove("ld-preview");
      });

      // highlight live
      let elements = document.querySelectorAll("li, p, span, td");

      elements.forEach(el => {
        let r = el.getBoundingClientRect();

        if (
          r.left < rect.right &&
          r.right > rect.left &&
          r.top < rect.bottom &&
          r.bottom > rect.top
        ) {
          el.classList.add("ld-preview");
        }
      });
    };

    const onMouseUp = () => {
      document.body.style.cursor = "default";

      let rect = selectionBox.getBoundingClientRect();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      // remove preview
      document.querySelectorAll(".ld-preview").forEach(el => {
        el.classList.remove("ld-preview");
      });

      selectionBox.remove();

      let elements = document.querySelectorAll("li, p, span, td");

      let selected = Array.from(elements).filter(el => {
        let r = el.getBoundingClientRect();

        return (
          r.left < rect.right &&
          r.right > rect.left &&
          r.top < rect.bottom &&
          r.bottom > rect.top
        );
      });

      data = selected
        .map(el => el.innerText.trim())
        .filter(text =>
          text.length > 2 &&
          text.length < 40 &&
          /^[a-zA-Z0-9\s._-]+$/.test(text)
        );

      data = [...new Set(data)];

      resultBox.innerText = `🎯 Selected ${data.length} entries`;
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousedown", onMouseDown, { once: true });
};