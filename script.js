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
    // Code for Actual AI feedback
const GEMINI_KEY = "AIzaSyAbb_j0igY4woK05T0Mt2q9eZQv0mFuU6I";

async function getRealAIFeedback() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Student marks: \( {subjects.map((s,i) => ` \){s}: ${marks[i]}`).join(", ")}. Average: ${average.toFixed(1)}%. Give short, motivational study advice in 4-5 lines.`
        }]
      }]
    })
  });

  const data = await response.json();
  const aiText = data.candidates[0].content.parts[0].text;

  const aiBox = document.createElement("div");
  aiBox.innerHTML = `<strong>🌟 Real Gemini AI Feedback:</strong><br>${aiText}`;
  aiBox.style.cssText = "margin-top:20px;padding:15px;background:rgba(255,255,255,0.2);border-radius:12px;color:white;";
  document.getElementById("result").appendChild(aiBox);
}

// Call it after charts
getRealAIFeedback();
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

  // Performance message
  let message = "";
  if (average >= 90) message = "Outstanding! 🌟";
  else if (average >= 80) message = "Very Good! 👍";
  else if (average >= 70) message = "Good 👌";
  else if (average >= 60) message = "Average";
  else if (average >= 50) message = "Needs Improvement ⚠️";
  else message = "Requires serious effort ❗";

  // Show result
  document.getElementById("summary").innerHTML = 
    `Total subjects: ${count}<br>Total marks: ${total.toFixed(1)}<br>Average: ${average.toFixed(2)}%`;
  document.getElementById("performance").innerHTML = message;

  document.getElementById("result").style.display = "block";
  document.querySelector(".charts").style.display = "flex";

  // Destroy previous charts if exist
  if (barChartInstance) barChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();

  // Bar Chart – Subject wise
  const ctxBar = document.getElementById("barChart").getContext("2d");
  barChartInstance = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [{
        label: "Marks",
        data: marks,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 100 } },
      plugins: { title: { display: true, text: "Subject-wise Marks" } }
    }
  });

  // Pie Chart – Overall performance
  const ctxPie = document.getElementById("pieChart").getContext("2d");
  pieChartInstance = new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: ["Achieved", "Remaining to 100%"],
      datasets: [{
        data: [average, 100 - average],
        backgroundColor: ["#36A2EB", "#FF6384"]
      }]
    },
    options: {
      plugins: { title: { display: true, text: `Overall Performance (${average.toFixed(1)}%)` } }
    }
  });
}
