// Henter brett-elementet fra HTML ved ID
const grid = document.getElementById("buttonGrid");

// Størrelse på brettet (7x7)
const size = 7;

// Farger for de forskjellige "ringene" på brettet
const COLORS = {
  green: "#2ea44f",
  yellow: "#f2c230",
  orange: "#e67e22",
  red: "#c0392b",
};

// Hent lagrede data fra localStorage (eller lag tomt objekt)
let savedValues = JSON.parse(localStorage.getItem("boardValues")) || {};

function saveBoard() {
  localStorage.setItem("boardValues", JSON.stringify(savedValues));
}

/* ---------- helpers ---------- */
function applyStatus(btn, status) {
  // remove previous
  btn.classList.remove("cube-sold", "cube-lost");
  const badge = btn.querySelector(".status-badge");
  if (badge) {
    badge.textContent = "";
    badge.classList.add("hidden");
  }

  // apply
  if (status === "sold") {
    btn.classList.add("cube-sold");
    if (badge) {
      badge.textContent = "SOLD";
      badge.classList.remove("hidden");
    }
  } else if (status === "lost") {
    btn.classList.add("cube-lost");
    if (badge) {
      badge.textContent = "LOST";
      badge.classList.remove("hidden");
    }
  }
}

function renderCube(btn, vals) {
  // numbers
  const circleEl = btn.querySelector(".circle-val");
  const triEl = btn.querySelector(".triangle-val");
  const sqEl = btn.querySelector(".square-val");

  const setCell = (el, v) => {
    if (v !== undefined && v !== "-") {
      el.textContent = v;
      el.classList.add("active");
    } else {
      el.textContent = "-";
      el.classList.remove("active");
    }
  };

  setCell(circleEl, vals.circle);
  setCell(triEl, vals.triangle);
  setCell(sqEl, vals.square);

  // status
  applyStatus(btn, vals.status || "none");
}
/* -------------------------------- */

// === Opprett ruter (7x7) ===
for (let i = 0; i < size * size; i++) {
  const btn = document.createElement("button");
  btn.classList.add("cube");
  const row = Math.floor(i / size);
  const col = i % size;
  const d = Math.max(Math.abs(row - 3), Math.abs(col - 3));

  if (d === 3) btn.style.border = `4px solid ${COLORS.green}`;
  else if (d === 2) btn.style.border = `4px solid ${COLORS.yellow}`;
  else if (d === 1) btn.style.border = `4px solid ${COLORS.orange}`;
  else btn.style.border = `4px solid ${COLORS.red}`;

  // Legger til formene, plassholdere og badge
  btn.innerHTML = `
    <div class="icon-col">
      <svg class="icon" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
      <svg class="icon" viewBox="0 0 100 100"><polygon points="50,0 100,100 0,100"/></svg>
      <svg class="icon" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100"/></svg>
    </div>
    <div class="input-icon">
      <div class="chosen-number circle-val">-</div>
      <div class="chosen-number triangle-val">-</div>
      <div class="chosen-number square-val">-</div>
    </div>
    <div class="status-badge hidden" aria-hidden="true"></div>
  `;

  // Hent lagrede verdier og render
  const vals = savedValues[i] || { circle: "-", triangle: "-", square: "-", status: "none" };
  renderCube(btn, vals);

  btn.addEventListener("click", () => openPopup(i, btn));
  grid.appendChild(btn);
}

// === POPUP LOGIC ===
let activeBtn = null;
let activeIndex = null;
let pendingValues = { circle: "0", triangle: "0", square: "0", status: "none" };

const popup = document.getElementById("popup");
const saveBtn = document.getElementById("popupSave");
const cancelBtn = document.getElementById("popupCancel");
const statusGroup = document.getElementById("statusButtons");

// Åpne popup når en rute klikkes
function openPopup(index, button) {
  activeBtn = button;
  activeIndex = index;

  const saved = savedValues[index] || { circle: "0", triangle: "0", square: "0", status: "none" };
  pendingValues = { ...saved };

  // Oppdater tallvalg
  document.querySelectorAll(".shapeButtons").forEach((row) => {
    const shape = row.dataset.shape;
    row.querySelectorAll(".num-btn").forEach((b) => {
      b.classList.toggle("selected", b.textContent === String(pendingValues[shape]));
    });
  });

  // Oppdater statusvalg
  if (statusGroup) {
    statusGroup.querySelectorAll(".status-btn").forEach((b) => {
      b.classList.toggle("selected", b.dataset.status === pendingValues.status);
    });
  }

  popup.classList.remove("hidden");
}

// Tallvalg i popup
document.querySelectorAll(".shapeButtons").forEach((row) => {
  const shape = row.dataset.shape;
  row.querySelectorAll(".num-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      row.querySelectorAll(".num-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      pendingValues[shape] = btn.textContent;
    });
  });
});

// Statusvalg i popup
if (statusGroup) {
  statusGroup.querySelectorAll(".status-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      statusGroup.querySelectorAll(".status-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      pendingValues.status = btn.dataset.status; // "none" | "sold" | "lost"
    });
  });
}

// Lagre knapp i popup
saveBtn.addEventListener("click", () => {
  if (!activeBtn) return;

  // Persist
  savedValues[activeIndex] = {
    circle: String(pendingValues.circle ?? "0"),
    triangle: String(pendingValues.triangle ?? "0"),
    square: String(pendingValues.square ?? "0"),
    status: pendingValues.status ?? "none",
  };
  saveBoard();

  // Oppdater visning på valgt knapp
  renderCube(activeBtn, savedValues[activeIndex]);

  closePopup();
});

// Avbryt knapp
cancelBtn.addEventListener("click", closePopup);

function closePopup() {
  popup.classList.add("hidden");
  activeBtn = null;
  activeIndex = null;
}

// === CLEAR ALL FUNKSJON ===
const clearAllBtn = document.getElementById("clearAllBtn");
const confirmPopup = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");
const confirmResetBtn = document.getElementById("confirmResetBtn");

clearAllBtn.addEventListener("click", () => {
  confirmPopup.classList.remove("hidden");
});

cancelReset.addEventListener("click", () => {
  confirmPopup.classList.add("hidden");
});

confirmResetBtn.addEventListener("click", () => {
  localStorage.removeItem("boardValues");
  confirmPopup.classList.add("hidden");
  window.location.reload();
});
