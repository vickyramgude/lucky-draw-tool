console.log("WHEEL LOADED 🎡");

let tickSound;
let winSound;

function initSounds() {
  tickSound = new Audio(chrome.runtime.getURL("sounds/tick.mp3"));
  winSound = new Audio(chrome.runtime.getURL("sounds/win.mp3"));

  tickSound.volume = 0.3;
  winSound.volume = 0.8;
}

// 🎉 CONFETTI
function createConfetti() {
  for (let i = 0; i < 80; i++) {
    let confetti = document.createElement("div");

    let colors = ["#ff5252", "#ff9800", "#ffeb3b", "#4caf50", "#2196f3", "#9c27b0"];
    let color = colors[Math.floor(Math.random() * colors.length)];

    Object.assign(confetti.style, {
      position: "fixed",
      top: "-10px",
      left: Math.random() * 100 + "vw",
      width: "8px",
      height: "8px",
      background: color,
      opacity: "0.8",
      borderRadius: "2px",
      zIndex: "999999"
    });

    document.body.appendChild(confetti);

    let fall = Math.random() * 3 + 2;

    confetti.animate([
      { transform: "translateY(0) rotate(0deg)" },
      { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)` }
    ], {
      duration: fall * 1000,
      easing: "linear"
    });

    setTimeout(() => confetti.remove(), fall * 1000);
  }
}

// 🎡 MAIN FUNCTION
function showWinnerPopup(winners) {

  initSounds();

  let overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.85)",
    zIndex: "999999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  // 🎡 WHEEL
  let wheel = document.createElement("div");
  Object.assign(wheel.style, {
    position: "relative",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    overflow: "hidden", // 🔥 IMPORTANT (keeps slices inside)
    border: "4px solid white",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)"
  });

  // 🌀 SPIN LAYER
  let spinLayer = document.createElement("div");
  Object.assign(spinLayer.style, {
    width: "100%",
    height: "100%",
    position: "absolute",
    borderRadius: "50%",
    transition: "transform 4s cubic-bezier(0.25, 1, 0.5, 1)"
  });

  wheel.appendChild(spinLayer);

  // 🎯 CENTER WINNER
  let center = document.createElement("div");
  center.innerText = winners[0];

  Object.assign(center.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
    zIndex: "10",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)"
  });

  wheel.appendChild(center);

  // 👥 SLICES (FIXED PROPERLY)
  let others = winners.slice(1, 10);
  let total = others.length;
  let angle = 360 / total;

  others.forEach((name, i) => {

    let slice = document.createElement("div");

    Object.assign(slice.style, {
      position: "absolute",
      width: "50%",
      height: "50%",
      top: "50%",
      left: "50%",
      transformOrigin: "0% 0%",
      transform: `rotate(${i * angle}deg) skewY(${90 - angle}deg)`,
      background: i % 2 === 0 ? "#ffffff" : "#e0e0e0",
      border: "1px solid rgba(0,0,0,0.1)"
    });

    let text = document.createElement("div");
    text.innerText = name;

    Object.assign(text.style, {
      position: "absolute",
      top: "50%",
      left: "10px",
      transform: `
        rotate(${angle / 2}deg)
        skewY(-${90 - angle}deg)
        translateY(-50%)
      `,
      fontSize: "11px",
      fontWeight: "bold",
      color: "#333",
      width: "90px",
      textAlign: "center"
    });

    slice.appendChild(text);
    spinLayer.appendChild(slice);
  });

  // 🔻 POINTER
  let pointer = document.createElement("div");
  pointer.innerText = "▼";

  Object.assign(pointer.style, {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "24px",
    color: "red",
    zIndex: "20"
  });

  overlay.appendChild(pointer);
  overlay.appendChild(wheel);
  document.body.appendChild(overlay);

  // 🔊 SOUND LOOP
  let tickInterval = setInterval(() => {
    if (tickSound) {
      tickSound.currentTime = 0;
      tickSound.play().catch(() => {});
    }
  }, 120);

  // 🌀 SPIN
  setTimeout(() => {
    let others = winners.slice(1, 10);
    let total = others.length;

  // winner is always index 0 (center)
    let winnerIndex = 0;

  // each slice angle
    let anglePerSlice = 360 / total;

  // we want pointer at TOP (0 deg)
  // so rotate wheel so winner lands there

    let targetAngle = 360 - (winnerIndex * anglePerSlice);

  // add spins for animation
    let spins = 5;

  // final rotation
    let finalDeg = spins * 360 + targetAngle;

    spinLayer.style.transform = `rotate(${finalDeg}deg)`;
  }, 100);

  // 🎉 FINISH
  setTimeout(() => {
    clearInterval(tickInterval);

    if (winSound) {
      winSound.currentTime = 0;
      winSound.play().catch(() => {});
    }

    center.style.background = "#ff9800";
    center.style.transform = "translate(-50%, -50%) scale(1.2)";

    createConfetti();

  }, 4200);

  overlay.onclick = () => overlay.remove();
}

window.showWinnerPopup = showWinnerPopup;