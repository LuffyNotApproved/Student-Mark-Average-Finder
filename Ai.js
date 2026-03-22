// Ai.js — Groq only, shows real error on page if fails

async function addGroqFeedback(subjects, marks, average) {
  const resultDiv = document.getElementById("result");
  if (!resultDiv) return; // safety

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
        model: "llama3-70b-8192",  // ← changed to most stable current model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 180
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Groq failed with status ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || "No advice received.";

    const aiBox = document.createElement("div");
    aiBox.style.cssText = `
      margin-top: 25px;
      padding: 18px;
      background: rgba(100, 255, 218, 0.2);
      border-radius: 12px;
      text-align: left;
      color: white;
      border: 1px solid rgba(100, 255, 218, 0.4);
    `;
    aiBox.innerHTML = `<strong>🌟 Groq AI Feedback:</strong><br><br>${aiText.replace(/\n/g, "<br>")}`;
    resultDiv.appendChild(aiBox);

  } catch (error) {
    const errorBox = document.createElement("div");
    errorBox.style.cssText = `
      margin-top: 20px;
      padding: 15px;
      background: rgba(255, 70, 70, 0.25);
      border-radius: 10px;
      color: #ffdddd;
    `;
    errorBox.innerHTML = `
      <strong>AI Error:</strong><br>
      ${error.message || "Unknown error"}<br>
      (Groq request failed – see details above)
    `;
    resultDiv.appendChild(errorBox);
  }
}
