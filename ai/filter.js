// Debug log
console.log("AI filter loaded!");

// AI-like smart filter
function isValidName(text) {
  text = text.trim();

  // Length check
  if (text.length < 3 || text.length > 40) return false;

  // Remove weird characters
  if (/[^a-zA-Z0-9\s._-]/.test(text)) return false;

  // Blacklist common UI words
  const blacklist = [
    "login", "signup", "menu", "home", "about",
    "contact", "search", "next", "previous",
    "read more", "click here", "submit"
  ];

  let lower = text.toLowerCase();
  if (blacklist.some(word => lower.includes(word))) return false;

  let words = text.split(" ").filter(w => w.length > 0);

  let score = 0;

  // 2–3 words → likely real name
  if (words.length === 2 || words.length === 3) score += 2;

  // Starts with capital (John Doe)
  if (/^[A-Z]/.test(text)) score += 1;

  // Short phrases only
  if (words.length <= 4) score += 1;

  // Username style
  if (/^[a-zA-Z0-9._-]+$/.test(text) && words.length === 1) score += 1;

  // Too many numbers = bad
  if ((text.match(/\d/g) || []).length > 3) score -= 1;

  return score >= 1; // balanced filtering
}

// Make it global so content.js can use it
window.isValidName = isValidName;