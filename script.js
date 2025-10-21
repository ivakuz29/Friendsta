// Henter brett-elementet fra HTML ved ID
const grid = document.getElementById("buttonGrid");

// Størrelse på brettet (7x7)
const size = 7;

// Farger for de forskjellige "ringene" på brettet
const COLORS = {
  green: "#2ea44f",
  yellow: "#f2c230",
  orange: "#e67e22",
  red: "#c0392b"
};

let savedValues = JSON.parse(localStorage.getItem("boardValues")) || {};

// Funksjon for å lagre hele brettet til localStorage
function saveBoard() {
  localStorage.setItem("boardValues", JSON.stringify(savedValues));
}

// === Opprett ruter (7x7) ===
for (let i = 0; i < size * size; i++) {
  const btn = document.createElement("button");
  const row = Math.floor(i / size);
  const col = i % size;
  const d = Math.max(Math.abs(row - 3), Math.abs(col - 3));

  if (d === 3) btn.style.border = `4px solid ${COLORS.green}`;
  else if (d === 2) btn.style.border = `4px solid ${COLORS.yellow}`;
  else if (d === 1) btn.style.border = `4px solid ${COLORS.orange}`;
  else btn.style.border = `4px solid ${COLORS.red}`;

  // Lag ikoner og placeholders
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
  `;

// Apply saved values + visibility if they exist
if (savedValues[i]) {
  const circleEl = btn.querySelector(".circle-val");
  const triEl = btn.querySelector(".triangle-val");
  const sqEl = btn.querySelector(".square-val");

  const vals = savedValues[i];

  if (vals.circle && vals.circle !== "-" && vals.circle !== "0") {
    circleEl.textContent = vals.circle;
    circleEl.classList.add("active");
  }
  if (vals.triangle && vals.triangle !== "-" && vals.triangle !== "0") {
    triEl.textContent = vals.triangle;
    triEl.classList.add("active");
  }
  if (vals.square && vals.square !== "-" && vals.square !== "0") {
    sqEl.textContent = vals.square;
    sqEl.classList.add("active");
  }
}


  btn.addEventListener("click", () => openPopup(i, btn));
  grid.appendChild(btn);
}

// === POPUP LOGIC (new version with all shapes visible) ===
let activeBtn = null;
let activeIndex = null;
let pendingValues = { circle: "-", triangle: "-", square: "-" };

// references
const popup = document.getElementById("popup");
const saveBtn = document.getElementById("popupSave");
const cancelBtn = document.getElementById("popupCancel");

// click cube -> open popup
function openPopup(index, button) {
  activeBtn = button;
  activeIndex = index;

  // load saved or default
  const saved = savedValues[index] || { circle: "0", triangle: "0", square: "0" };
  pendingValues = { ...saved };

  // reset buttons
  document.querySelectorAll(".shapeButtons").forEach(row => {
    const shape = row.dataset.shape;
    row.querySelectorAll(".num-btn").forEach(btn => {
      btn.classList.toggle("selected", btn.textContent === pendingValues[shape]);
    });
  });

  popup.classList.remove("hidden");
}

// number selection
document.querySelectorAll(".shapeButtons").forEach(row => {
  const shape = row.dataset.shape;
  row.querySelectorAll(".num-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      row.querySelectorAll(".num-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      pendingValues[shape] = btn.textContent;
    });
  });
});

saveBtn.addEventListener("click", () => {
  if (!activeBtn) return;
  savedValues[activeIndex] = { ...pendingValues };
  saveBoard();

  // update text + visibility
  const circleEl = activeBtn.querySelector(".circle-val");
  const triEl = activeBtn.querySelector(".triangle-val");
  const sqEl = activeBtn.querySelector(".square-val");

  [circleEl, triEl, sqEl].forEach((el, i) => {
    const val = Object.values(pendingValues)[i];
    if (val && val !== "-" && val !== "0") {
      el.textContent = val;
      el.classList.add("active");
    } else {
      el.textContent = "";
      el.classList.remove("active");
    }
  });

  closePopup();
});


// cancel
cancelBtn.addEventListener("click", closePopup);

function closePopup() {
  popup.classList.add("hidden");
  activeBtn = null;
  activeIndex = null;
}

// === CLEAR ALL FUNCTIONALITY ===
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
  window.location.reload(); // reload the board cleanly
});

