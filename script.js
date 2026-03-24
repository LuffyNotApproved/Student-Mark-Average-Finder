let barChart = null;
let pieChart = null;

function saveGroqKey() {
  var key = document.getElementById("groqKey").value;
  if (key.length > 10 && key.indexOf("gsk_") === 0) {
    localStorage.setItem("groqKey", key);
    alert("Key saved successfully! AI review is now active.");
  } else {
    alert("Please enter a valid Groq key starting with gsk_");
  }
}

function createInputs() {
  var countStr = document.getElementById("numSub").value;
  var count = Number(countStr);

  if (count < 1 || count > 10) {
    alert("Please enter a number between 1 and 10");
    return;
  }

  var area = document.getElementById("inputBox");
  area.innerHTML = "";

  for (var i = 1; i <= count; i++) {
    var div = document.createElement("div");
    div.innerHTML = `
      <input type="text" placeholder="Subject ` + i + `" class="subj">
      <input type="number" placeholder="Marks" min="0" max="100" class="mrk">
    `;
    area.appendChild(div);
  }

  document.getElementById("calcButton").style.display = "inline-block";
}

function doCalculation() {
  var subjInputs = document.querySelectorAll(".subj");
  var markInputs = document.querySelectorAll(".mrk");

  var subjects = [];
  var marks = [];
  var total = 0;

  for (var i = 0; i < markInputs.length; i++) {
    var m = Number(markInputs[i].value);
    var name = subjInputs[i].value.trim();
    if (name === "") name = "Subject " + (i+1);

    if (m < 0 || m > 100) {
      alert("All marks must be between 0 and 100");
      return;
    }

    subjects.push(name);
    marks.push(m);
    total = total + m;
  }

  var avg = total / marks.length;

  var grade = "";
  if (avg >= 90) grade = "Outstanding! 🌟";
  else if (avg >= 80) grade = "Very Good! 👍";
  else if (avg >= 70) grade = "Good 👌";
  else if (avg >= 60) grade = "Average";
  else if (avg >= 50) grade = "Needs Improvement ⚠️";
  else grade = "Requires serious effort ❗";

  document.getElementById("infoArea").innerHTML = `
    Total Subjects: ` + marks.length + `<br>
    Total Marks: ` + total.toFixed(1) + `<br>
    Average: ` + avg.toFixed(2) + `%<br>
    <strong>` + grade + `</strong>
  `;

  document.getElementById("showArea").style.display = "block";

  // Charts
  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  barChart = new Chart(document.getElementById("barCanvas"), {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [{ label: "Marks", data: marks, backgroundColor: "#ffeb3b" }]
    },
    options: { scales: { y: { beginAtZero: true, max: 100 } } }
  });

  pieChart = new Chart(document.getElementById("pieCanvas"), {
    type: "pie",
    data: {
      labels: ["Achieved", "Remaining"],
      datasets: [{ data: [avg, 100 - avg], backgroundColor: ["#ffeb3b", "#444"] }]
    }
  });

  // AI Box
  var savedKey = localStorage.getItem("groqKey");
  var box = document.getElementById("aiArea");

  if (savedKey && savedKey.indexOf("gsk_") === 0) {
    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + savedKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: "Student marks: " + subjects.map(function(s,i){return s + ":" + marks[i];}).join(", ") + ". Average: " + avg.toFixed(1) + "%. Give short motivational advice with emojis." }],
        temperature: 0.7,
        max_tokens: 150
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      box.innerHTML = "<strong>🌟 Groq AI Review:</strong><br><br>" + d.choices[0].message.content.replace(/\n/g, "<br>");
    })
    .catch(function() {
      box.innerHTML = "<strong>🌟 Groq AI Review:</strong><br><br>Unable to connect to Groq. Please check your key.";
    });
  } else {
    box.innerHTML = "<strong>🌟 Groq AI Review:</strong><br><br>Paste your Groq key above to get real AI advice.";
  }
}
