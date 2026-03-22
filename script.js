console.log("script.js fully executed – functions should be available now");
// alert("script.js loaded and ran successfully!"); // uncomment if you want debug alert

let barChartInstance = null;
let pieChartInstance = null;

function generateInputs() {
  const num = parseInt(document.getElementById("numSubjects").value);
  if (isNaN(num) || num < 1 || num > 10) {
    alert("Please enter a number between 1 and 10.");
    return;
  }

  const container = document.getElementById("subjectsContainer");
  container.innerHTML = "";

  for (let i = 1; i <= num; i++) {
    const div = document.createElement("div");
    div.className = "subject-row";
    div.innerHTML = `
      <input type="text" placeholder="Subject ${i} name" class="sub-name" />
      <input type="number" placeholder="Marks (0-100)" class="sub-marks" min="0" max="100" />
    `;
    container.appendChild(div);
  }

  document.getElementById("calculateBtn").style.display = "inline-block";
}

function calculateAndShow() {
  const nameInputs = document.querySelectorAll(".sub-name");
  const markInputs = document.querySelectorAll(".sub-marks");

  const subjects = [];
  const marks = [];
  let total = 0;
  let valid = true;

  for (let i = 0; i < markInputs.length; i++) {
    const markStr = markInputs[i].value.trim();
    const mark = parseFloat(markStr);
    const subName = nameInputs[i].value.trim() || `Subject ${i+1}`;

    if (!markStr || isNaN(mark) || mark < 0 || mark > 100) {
      valid = false;
      break;
    }

    subjects.push(subName);
    marks.push(mark);
    total += mark;
  }

  if (!valid || marks.length === 0) {
    alert("Please fill all marks correctly (0–100).");
    return;
  }

  const count = marks.length;
  const average = total / count;

  let message = "";
  if (average >= 90) message = "Outstanding! 🌟";
  else if (average >= 80) message = "Very Good! 👍";
  else if (average >= 70) message = "Good 👌";
  else if (average >= 60) message = "Average";
  else if (average >= 50) message = "Needs Improvement ⚠️";
  else message = "Requires serious effort ❗";

  document.getElementById("summary").innerHTML = 
    `Total subjects: ${count}<br>Total marks: ${total.toFixed(1)}<br>Average: ${average.toFixed(2)}%`;
  document.getElementById("performance").innerHTML = message;

  document.getElementById("result").style.display = "block";
  document.querySelector(".charts").style.display = "flex";

  if (barChartInstance) barChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();

  const ctxBar = document.getElementById("barChart").getContext("2d");
  barChartInstance = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [{
        label: "Marks",
        data: marks,
        backgroundColor: "rgba(255, 235, 59, 0.7)", // yellow bars
        borderColor: "#ffeb3b",
        borderWidth: 1
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 100 } },
      plugins: { title: { display: true, text: "Subject-wise Marks" } }
    }
  });

  const ctxPie = document.getElementById("pieChart").getContext("2d");
  pieChartInstance = new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: ["Achieved", "Remaining to 100%"],
      datasets: [{
        data: [average, 100 - average],
        backgroundColor: ["#ffeb3b", "#333333"] // yellow + dark
      }]
    },
    options: {
      plugins: { title: { display: true, text: `Overall Performance (${average.toFixed(1)}%)` } }
    }
  });

  // ================================================
  // SPECIAL AI TIP BOX – always appears on page
  // ================================================
  const aiTipBox = document.createElement("div");
  aiTipBox.className = "ai-tip-box"; // uses the CSS class from style.css

  let tipHTML = `
    <strong>🌟 Groq AI Study Tip</strong><br><br>
    Loading advice from Groq...
  `;

  // Try real Groq
  (async () => {
    try {
      const prompt = `Student marks: \( {subjects.map((s, i) => ` \){s}: ${marks[i]}`).join(", ")}. Average: ${average.toFixed(1)}%. Give short, motivational, personalised study advice in 4-5 lines. Use emojis. Be encouraging.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 180
        })
      });

      if (!response.ok) throw new Error("Groq error " + response.status);

      const data = await response.json();
      const aiText = data.choices[0].message.content;
      aiTipBox.innerHTML = `<strong>🌟 Groq AI Advice:</strong><br><br>${aiText.replace(/\n/g, "<br>")}`;
    } catch (e) {
      aiTipBox.innerHTML = `
        <strong>🌟 AI Tip (Quick Mode):</strong><br><br>
        Your average is ${average.toFixed(1)}% — solid work!<br>
        Focus extra on your lowest subject and you'll hit 90+ soon! 💪🚀
      `;
    }
  })();

  document.getElementById("result").appendChild(aiTipBox);
  // ================================================
}
