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

  // Safe call to AI function from Ai.js
  if (typeof addGroqFeedback === "function") {
    addGroqFeedback(subjects, marks, average);
  } else {
    console.log("Ai.js not loaded or function missing");
  }
}
