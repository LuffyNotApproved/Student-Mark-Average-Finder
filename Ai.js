// Ai.js — fixed to show output on page

async function addGroqFeedback(subjects, marks, average) {
  console.log("addGroqFeedback called with average:", average);

  const resultDiv = document.getElementById("result");
  if (!resultDiv) {
    console.error("Result div not found! ID: 'result' must exist in HTML.");
    return;
  }

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

    console.log("Groq response status:", response.status);

    if (!response.ok) {
      throw new Error(`Groq returned ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || "No advice received from AI.";

    console.log("AI text received:", aiText);

    // Create and show the box
    const aiBox = document.createElement("div");
    aiBox.style.cssText = `
      margin-top: 25px;
      padding: 18px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      text-align: left;
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
    `;
    aiBox.innerHTML = `<strong>🌟 Groq AI (Llama 3.3) Feedback:</strong><br><br>${aiText.replace(/\n/g, "<br>")}`;

    resultDiv.appendChild(aiBox);
    console.log("AI box appended to page");

  } catch (error) {
    console.error("Groq AI failed:", error);

    // Fallback message on page (so you see something)
    const fallback = document.createElement("div");
    fallback.style.cssText = "margin-top:20px; padding:12px; background:rgba(255,100,100,0.2); border-radius:8px; color:#ffdddd;";
    fallback.innerHTML = "<strong>AI Tip Unavailable</strong><br>Check console for details, or try again later.";
    resultDiv.appendChild(fallback);
  }
}
