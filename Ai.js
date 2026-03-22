// Ai.js — super simple, no fancy stuff
async function addGroqFeedback(subjects, marks, average) {
  console.log("Trying to call Groq AI...");

  try {
    const prompt = "Student average: " + average.toFixed(1) + "%. Give 2 lines of motivational study advice with emojis.";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 120
      })
    });

    console.log("Groq response status:", response.status);

    if (!response.ok) throw new Error("Groq failed: " + response.status);

    const data = await response.json();
    const text = data.choices[0].message.content;

    const box = document.createElement("div");
    box.style = "margin-top:20px; padding:15px; background:rgba(255,255,255,0.2); border-radius:10px;";
    box.innerHTML = "<strong>🌟 AI Advice:</strong><br>" + text;
    document.getElementById("result").appendChild(box);

  } catch (err) {
    console.error("AI error:", err);
    const fallback = document.createElement("p");
    fallback.style.color = "yellow";
    fallback.textContent = "AI tip unavailable (check console)";
    document.getElementById("result").appendChild(fallback);
  }
}
