export function spinWheel(entries) {
  const winner = entries[Math.floor(Math.random() * entries.length)];

  console.log("🎉 Winner:", winner);

  return winner;
}