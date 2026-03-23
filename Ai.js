async function addGroqFeedback(subjects, marks, average) {
  const resultDiv = document.getElementById("result");
  if (!resultDiv) return;

  // Get key from localStorage (user added it)
  const GROQ_API_KEY = localStorage.getItem("groqApiKey");

  if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith("gsk_")) {
    const box = document.createElement("div");
    box.style = "margin-top:20px; padding:15px; background:#444; border-radius:12px; color:#ffeb3b;";
    box.innerHTML = "<strong>AI Disabled</strong><br>Paste your Groq API key above to enable real AI advice.";
    resultDiv.appendChild(box);
    return;
  }

  try {
    const prompt = `Student marks: \( {subjects.map((s, i) => ` \){s}: ${marks[i]}`).join(", ")}. Average: ${average.toFixed(1)}%. Give short, motivational, personalised study advice in 4-5 lines. Use emojis. Be encouraging.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 180
      })
    });

    if (!response.ok) throw new Error(`Groq error ${response.status}`);

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    const aiBox = document.createElement("div");
    aiBox.style = `
      margin-top: 25px;
      padding: 18px;
      background: rgba(255, 235, 59, 0.15);
      border: 2px solid #ffeb3b;
      border-radius: 16px;
      color: #ffeb3b;
    `;
    aiBox.innerHTML = `<strong>🌟 Groq AI Advice:</strong><br><br>${aiText.replace(/\n/g, "<br>")}`;
    resultDiv.appendChild(aiBox);

  } catch (error) {
    const box = document.createElement("div");
    box.style = "margin-top:20px; padding:15px; background:#ff444433; border-radius:10px; color:#ffdddd;";
    box.innerHTML = `<strong>AI Error:</strong><br>${error.message || "Unknown"}`;
    resultDiv.appendChild(box);
  }
}
