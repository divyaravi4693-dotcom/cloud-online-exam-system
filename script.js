const examQuestions = {
  "JavaScript Fundamentals": [
    {q:"Which keyword declares a block-scoped variable that can be reassigned?", options:["const","let","static","define"], answer:1},
    {q:"Which method converts a JSON string into a JavaScript object?", options:["JSON.parse()","JSON.stringify()","JSON.object()","parse.JSON()"], answer:0},
    {q:"What does === compare?", options:["Values only","Types only","Value and type","Object names"], answer:2},
    {q:"Which event occurs when a user clicks an element?", options:["change","submit","mouseover","click"], answer:3},
    {q:"Which array method adds an item to the end?", options:["shift()","push()","pop()","slice()"], answer:1}
  ],
  "Database Management": [
    {q:"What does SQL stand for?", options:["Structured Query Language","Simple Question List","System Queue Logic","Sequential Query Link"], answer:0},
    {q:"Which key uniquely identifies a row in a table?", options:["Foreign key","Primary key","Duplicate key","Index value"], answer:1},
    {q:"Which command retrieves data from a table?", options:["GET","OPEN","SELECT","FETCHTABLE"], answer:2},
    {q:"What is the purpose of normalization?", options:["Add duplicates","Reduce redundancy","Delete all rows","Encrypt columns"], answer:1},
    {q:"Which command adds a new row?", options:["INSERT","ALTER","UPDATE","CREATE"], answer:0}
  ],
  "Cloud Computing Basics": [
    {q:"What is cloud computing?", options:["Using only local disks","Delivering computing services over a network","A type of keyboard","A programming language"], answer:1},
    {q:"Which AWS service is object storage?", options:["Amazon EC2","Amazon S3","Amazon Route 53","AWS Lambda"], answer:1},
    {q:"What does SaaS stand for?", options:["Storage as a System","Software as a Service","Security as a Server","System and Software"], answer:1},
    {q:"Which cloud model combines private and public cloud?", options:["Public cloud","Private cloud","Hybrid cloud","Community-only cloud"], answer:2},
    {q:"What is scalability?", options:["Ability to adjust resources to demand","Deleting a database","Changing a password","Turning off all servers"], answer:0}
  ]
};

const completedResults = [
  {name:"HTML & CSS Basics", date:"08 Oct 2026", score:88, total:100},
  {name:"Introduction to Python", date:"04 Oct 2026", score:80, total:100}
];
let activeExam = "";
let activeQuestions = [];
let currentQuestion = 0;
let answers = [];
const dialog = document.getElementById("examDialog");
const toast = document.getElementById("toast");

document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"});

document.querySelectorAll("[data-exam]").forEach(button => {
  button.addEventListener("click", () => startExam(button.dataset.exam));
});

function startExam(name) {
  activeExam = name;
  activeQuestions = examQuestions[name] || [];
  currentQuestion = 0;
  answers = Array(activeQuestions.length).fill(null);
  document.getElementById("dialogTitle").textContent = name;
  renderQuestion();
  dialog.showModal();
}

function renderQuestion() {
  const container = document.getElementById("examContent");
  if (currentQuestion >= activeQuestions.length) return finishExam();
  const item = activeQuestions[currentQuestion];
  container.innerHTML = `
    <p class="question-count">Question ${currentQuestion + 1} of ${activeQuestions.length} · Practice mode</p>
    <h3 class="question-title">${escapeHTML(item.q)}</h3>
    <div class="answer-list">${item.options.map((option, index) => `
      <label class="answer-option">
        <input type="radio" name="answer" value="${index}" ${answers[currentQuestion] === index ? "checked" : ""}>
        <span>${escapeHTML(option)}</span>
      </label>`).join("")}
    </div>
    <div class="dialog-actions">
      <button class="btn btn-secondary" id="previousBtn" ${currentQuestion === 0 ? "disabled" : ""}>Previous</button>
      <button class="btn btn-primary" id="nextBtn">${currentQuestion === activeQuestions.length - 1 ? "Submit exam" : "Next question"} <span>→</span></button>
    </div>`;
  container.querySelectorAll('input[name="answer"]').forEach(input => {
    input.addEventListener("change", () => { answers[currentQuestion] = Number(input.value); });
  });
  document.getElementById("previousBtn").addEventListener("click", () => {
    if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (answers[currentQuestion] === null) {
      showToast("Please choose an answer before continuing.");
      return;
    }
    currentQuestion++;
    renderQuestion();
  });
}

function finishExam() {
  const correct = activeQuestions.reduce((sum, question, index) => sum + (question.answer === answers[index] ? 1 : 0), 0);
  const score = Math.round((correct / activeQuestions.length) * 100);
  const passed = score >= 50;
  const date = new Date().toLocaleDateString("en-GB", {day:"2-digit", month:"short", year:"numeric"});
  completedResults.unshift({name:activeExam, date, score, total:100});
  document.getElementById("examContent").innerHTML = `
    <div class="result-summary">
      <div class="result-score">${score}%</div>
      <h3>${passed ? "Well done!" : "Keep practising!"}</h3>
      <p>You answered ${correct} out of ${activeQuestions.length} questions correctly.<br>This is a local practice result and is not uploaded to a server.</p>
      <span class="status ${passed ? "status-pass" : "status-fail"}">${passed ? "Passed" : "Needs improvement"}</span>
    </div>
    <div class="dialog-actions"><button class="btn btn-secondary" id="closeResult">Close</button><button class="btn btn-primary" id="reviewResult">Review answers</button></div>`;
  document.getElementById("closeResult").addEventListener("click", () => { dialog.close(); updateDashboard(); });
  document.getElementById("reviewResult").addEventListener("click", () => renderReview());
  updateDashboard();
}

function renderReview() {
  const container = document.getElementById("examContent");
  container.innerHTML = `<p class="eyebrow">ANSWER REVIEW</p><h3 class="question-title">Your answers</h3>` +
    activeQuestions.map((q, i) => `<div style="padding:12px 0;border-top:1px solid #edf0f6">
      <p style="font-weight:700;margin:0 0 7px">${i+1}. ${escapeHTML(q.q)}</p>
      <p style="margin:0;color:${answers[i] === q.answer ? '#159b72' : '#d65d5d'};font-size:12px">Your answer: ${answers[i] === null ? "Not answered" : escapeHTML(q.options[answers[i]])}</p>
      <p style="margin:5px 0 0;color:#159b72;font-size:12px">Correct answer: ${escapeHTML(q.options[q.answer])}</p>
    </div>`).join("") +
    `<div class="dialog-actions"><button class="btn btn-primary" id="finishReview">Done</button></div>`;
  document.getElementById("finishReview").addEventListener("click", () => { dialog.close(); updateDashboard(); });
}

function updateDashboard() {
  const available = document.querySelectorAll(".exam-card").length;
  document.getElementById("availableCount").textContent = available;
  document.getElementById("completedCount").textContent = completedResults.length;
  const average = Math.round(completedResults.reduce((sum, item) => sum + item.score, 0) / completedResults.length);
  document.getElementById("averageScore").textContent = `${average}%`;
  document.getElementById("resultsBody").innerHTML = completedResults.map((item, index) => `
    <tr><td><span class="table-subject ${index % 2 ? "blue-dot" : "purple-dot"}"></span>${escapeHTML(item.name)}</td>
    <td>${escapeHTML(item.date)}</td><td><strong>${item.score}/100</strong></td>
    <td><span class="status ${item.score >= 50 ? "status-pass" : "status-fail"}">${item.score >= 50 ? "Passed" : "Try again"}</span></td></tr>`).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2500);
}
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
