const STORAGE_KEY = "aca-workouts";

const form = document.getElementById("workout-form");
const dateInput = document.getElementById("date");
const historyBody = document.getElementById("history-body");
const emptyState = document.getElementById("empty-state");
const progressSelect = document.getElementById("progress-exercise");
const progressChart = document.getElementById("progress-chart");

dateInput.valueAsDate = new Date();

function loadWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

let workouts = loadWorkouts();

function render() {
  renderHistory();
  renderProgressOptions();
  renderProgressChart();
}

function renderHistory() {
  historyBody.innerHTML = "";
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));

  emptyState.style.display = sorted.length === 0 ? "block" : "none";

  for (const w of sorted) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${w.date}</td>
      <td>${escapeHtml(w.exercise)}</td>
      <td>${w.sets}</td>
      <td>${w.reps}</td>
      <td>${w.weight ? w.weight + " lbs" : "—"}</td>
      <td><button type="button" class="delete-btn" data-id="${w.id}">Delete</button></td>
    `;
    historyBody.appendChild(row);
  }
}

function renderProgressOptions() {
  const exercises = [...new Set(workouts.map((w) => w.exercise))].sort();
  const previousValue = progressSelect.value;
  progressSelect.innerHTML = "";

  if (exercises.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No exercises logged yet";
    progressSelect.appendChild(opt);
    return;
  }

  for (const ex of exercises) {
    const opt = document.createElement("option");
    opt.value = ex;
    opt.textContent = ex;
    progressSelect.appendChild(opt);
  }

  if (exercises.includes(previousValue)) {
    progressSelect.value = previousValue;
  }
}

function renderProgressChart() {
  progressChart.innerHTML = "";
  const selected = progressSelect.value;
  const entries = workouts
    .filter((w) => w.exercise === selected && w.weight)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (entries.length === 0) {
    const p = document.createElement("p");
    p.className = "progress-empty";
    p.textContent = "Log a few workouts with a weight to see progress here.";
    progressChart.appendChild(p);
    return;
  }

  const maxWeight = Math.max(...entries.map((e) => e.weight));

  for (const e of entries) {
    const wrap = document.createElement("div");
    wrap.className = "progress-bar-wrap";

    const bar = document.createElement("div");
    bar.className = "progress-bar";
    const heightPct = Math.max(6, (e.weight / maxWeight) * 100);
    bar.style.height = `${heightPct}%`;
    bar.title = `${e.weight} lbs on ${e.date}`;

    const label = document.createElement("div");
    label.className = "progress-bar-label";
    label.textContent = `${e.weight}`;

    wrap.appendChild(bar);
    wrap.appendChild(label);
    progressChart.appendChild(wrap);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  const workout = {
    id: crypto.randomUUID(),
    exercise: formData.get("exercise").trim(),
    sets: Number(formData.get("sets")),
    reps: Number(formData.get("reps")),
    weight: formData.get("weight") ? Number(formData.get("weight")) : null,
    date: formData.get("date"),
  };

  workouts.push(workout);
  saveWorkouts(workouts);
  form.reset();
  dateInput.valueAsDate = new Date();
  render();
});

historyBody.addEventListener("click", (event) => {
  const id = event.target.dataset.id;
  if (!id) return;
  workouts = workouts.filter((w) => w.id !== id);
  saveWorkouts(workouts);
  render();
});

progressSelect.addEventListener("change", renderProgressChart);

render();
