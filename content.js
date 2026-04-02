(function () {
  console.log("CONTENT SCRIPT LOADED 🚀");

  // 🚫 Prevent duplicate injection (STRONG CHECK)
  if (window.__LD_PANEL_LOADED__) {
    console.log("Already injected ❌");
    return;
  }
  window.__LD_PANEL_LOADED__ = true;

  if (document.getElementById("ld-panel")) return;

  // ================= PANEL =================
  const panel = document.createElement("div");
  panel.id = "ld-panel";

  panel.style.position = "fixed";
  panel.style.top = "100px";
  panel.style.right = "20px";
  panel.style.width = "260px";
  panel.style.background = "rgba(255,255,255,0.15)";
  panel.style.backdropFilter = "blur(12px)";
  panel.style.border = "1px solid rgba(255,255,255,0.3)";
  panel.style.borderRadius = "16px";
  panel.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
  panel.style.zIndex = "999999";
  panel.style.fontFamily = "Arial";
  panel.style.overflow = "hidden";

  panel.innerHTML = `
    <div id="ld-header" style="
      background: linear-gradient(135deg, #4CAF50, #2e7d32);
      color: white;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      cursor: move;
    ">
      <span>Lucky Draw</span>
      <span id="ld-toggle">−</span>
    </div>

    <div id="ld-body" style="padding:12px;">
      <label style="font-size:12px;">Number of Winners</label>
      <input id="ld-count" type="number" value="1" min="1"
        style="width:100%;padding:8px;margin-top:5px;margin-bottom:8px;border-radius:8px;border:none;"
      />

      <button id="ld-scan" class="ld-btn green">Scan Page</button>
      <button id="ld-draw" class="ld-btn blue">Pick Winner(s)</button>
      <button id="ld-copy" class="ld-btn orange">Copy Winners</button>
      <button id="ld-select" class="ld-btn purple">Select Area</button>

      <div id="ld-result" style="margin-top:10px;font-size:12px;max-height:100px;overflow:auto;"></div>
    </div>
  `;

  // ================= STYLE =================
  if (!document.getElementById("ld-style")) {
    const style = document.createElement("style");
    style.id = "ld-style";

    style.innerHTML = `
      .ld-btn {
        width:100%;
        padding:8px;
        margin-top:5px;
        border:none;
        border-radius:8px;
        color:white;
        cursor:pointer;
      }
      .green { background:#4CAF50; }
      .blue { background:#2196F3; }
      .orange { background:#ff9800; }
      .purple { background:#9c27b0; }

      .ld-preview {
        outline:2px solid #4CAF50;
        background:rgba(76,175,80,0.2);
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(panel);

  // ================= ELEMENTS =================
  const scanBtn = panel.querySelector("#ld-scan");
  const drawBtn = panel.querySelector("#ld-draw");
  const copyBtn = panel.querySelector("#ld-copy");
  const selectBtn = panel.querySelector("#ld-select");
  const resultBox = panel.querySelector("#ld-result");
  const header = panel.querySelector("#ld-header");
  const toggle = panel.querySelector("#ld-toggle");
  const body = panel.querySelector("#ld-body");

  let data = [];
  let winners = [];

  const clean = (t) => t.replace(/\s+/g, " ").trim();

  // ================= SCAN =================
  scanBtn.onclick = () => {
    let elements = document.querySelectorAll("li, p, span, td");

    data = [...new Set(
      Array.from(elements)
        .map(el => clean(el.innerText))
        .filter(text =>
          text &&
          text.length > 2 &&
          text.length < 40 &&
          /^[a-zA-Z0-9\s._-]+$/.test(text)
        )
    )];

    resultBox.innerText = `Found ${data.length} entries`;
  };

  // ================= DRAW =================
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

    let shuffled = [...data].sort(() => 0.5 - Math.random());

    winners = shuffled.slice(0, count);

    document.querySelectorAll(".ld-highlight").forEach(el => {
      el.classList.remove("ld-highlight");
      el.style.background = "";
    });

    document.querySelectorAll("li, p, span, td").forEach(el => {
      if (winners.includes(clean(el.innerText))) {
        el.style.background = "yellow";
        el.classList.add("ld-highlight");
      }
    });

    resultBox.innerHTML =
      "Winners:<br><br>" +
      winners.map((w, i) => `${i + 1}. ${w}`).join("<br>");
  };

  // ================= COPY =================
  copyBtn.onclick = () => {
    if (!winners.length) return;

    navigator.clipboard.writeText(winners.join("\n")).catch(() => {
      let t = document.createElement("textarea");
      t.value = winners.join("\n");
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    });

    resultBox.innerText = "Copied!";
  };

  // ================= TOGGLE =================
  toggle.onclick = () => {
    body.style.display = body.style.display === "none" ? "block" : "none";
  };

  // ================= DRAG =================
  let isDragging = false, offsetX, offsetY;

  header.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
  };

  document.onmousemove = (e) => {
    if (!isDragging) return;
    panel.style.left = e.clientX - offsetX + "px";
    panel.style.top = e.clientY - offsetY + "px";
    panel.style.right = "auto";
  };

  document.onmouseup = () => isDragging = false;

  // ================= SELECT AREA =================
  selectBtn.onclick = () => {
    resultBox.innerText = "Drag to select area";
    document.body.style.cursor = "crosshair";

    let box;

    const down = (e) => {
      let startX = e.clientX;
      let startY = e.clientY;

      box = document.createElement("div");
      box.style.position = "fixed";
      box.style.border = "2px solid #4CAF50";
      box.style.background = "rgba(76,175,80,0.2)";
      box.style.zIndex = "999999";
      document.body.appendChild(box);

      const move = (e) => {
        let x = Math.min(startX, e.clientX);
        let y = Math.min(startY, e.clientY);

        box.style.left = x + "px";
        box.style.top = y + "px";
        box.style.width = Math.abs(e.clientX - startX) + "px";
        box.style.height = Math.abs(e.clientY - startY) + "px";
      };

      const up = () => {
        document.body.style.cursor = "default";

        let rect = box.getBoundingClientRect();
        box.remove();

        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);

        let elements = document.querySelectorAll("li, p, span, td");

        data = [...new Set(
          Array.from(elements)
            .filter(el => {
              let r = el.getBoundingClientRect();
              return (
                r.left < rect.right &&
                r.right > rect.left &&
                r.top < rect.bottom &&
                r.bottom > rect.top
              );
            })
            .map(el => clean(el.innerText))
        )];

        resultBox.innerText = `Selected ${data.length} entries`;
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };

    document.addEventListener("mousedown", down, { once: true });
  };

})();