console.log("GEMINI LOADED 🤖");

async function detectNamesWithAI(list) {
  const apiKey = "AIzaSyBEZLilH9xgEshMYtCjHy8yfuew_DJaQMc";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Extract only real human names or usernames. Return only names:\n\n" + list.join("\n")
                }
              ]
            }
          ]
        })
      }
    );

    const data = await res.json();

    console.log("Gemini response:", data);

    if (!data.candidates) {
      console.error("❌ Gemini failed:", data);
      return [];
    }

    let text = data.candidates[0].content.parts[0].text;

    return text
      .split("\n")
      .map(x => x.trim())
      .filter(x => x);

  } catch (err) {
    console.error("Gemini Error:", err);
    return [];
  }
}

window.detectNamesWithAI = detectNamesWithAI;