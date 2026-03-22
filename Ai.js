// Ai.js - cleaned and syntactically correct

async function addGroqFeedback(subjects, marks, average) {
  const GROQ_API_KEY = "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";

  try {
    const prompt = `Student marks: \( {subjects.map((s, i) => ` \){s}: ${marks[i]}`).join(", ")}. Average: ${average.toFixed(1)}%. Give short, motivational, personalised study advice in 4-5 lines. Use emojis. Be encouraging.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 180
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || "No advice received from AI.";

    const aiBox = document.createElement("div");
    aiBox.style.cssText = `
      margin-top: 25px;
      padding: 18px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      text-align: left;
      color: white;
    `;
    aiBox.innerHTML = `<strong>🌟 Groq AI Feedback:</strong><br><br>${aiText}`;
    document.getElementById("result").appendChild(aiBox);

  } catch (error) {
    console.error("Groq AI failed (main app continues normally):", error);
  }
}
