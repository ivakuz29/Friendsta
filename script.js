// Henter brett-elementet fra HTML ved ID
const grid = document.getElementById("buttonGrid");

// Størrelse på brettet (7x7)
const size = 7;

// Farger for de forskjellige "ringene" på brettet
const COLORS = {
  green: "#2ea44f",   // ytterste ring
  yellow: "#f2c230",  // andre ring
  orange: "#e67e22",  // tredje ring
  red: "#c0392b"      // midten
};

// Hent lagrede data fra localStorage (eller lag tom array)
let savedValues = JSON.parse(localStorage.getItem("boardValues")) || {};

// Funksjon for å lagre hele brettet til localStorage
function saveBoard() {
  localStorage.setItem("boardValues", JSON.stringify(savedValues));
}

// Opprett 49 (7x7) knapper på brettet
for (let i = 0; i < size * size; i++) {
  const btn = document.createElement("button");
  const row = Math.floor(i / size);
  const col = i % size;

  // Beregner avstanden fra midten (3,3)
  const d = Math.max(Math.abs(row - 3), Math.abs(col - 3));

  // Setter farge og kant etter hvilken ring knappen tilhører
  if (d === 3) {
    btn.style.border = `4px solid ${COLORS.green}`;
  } else if (d === 2) {
    btn.style.border = `4px solid ${COLORS.yellow}`;
  } else if (d === 1) {
    btn.style.border = `4px solid ${COLORS.orange}`;
  } else {
    btn.style.border = `4px solid ${COLORS.red}`;
  }

  // Legger til formene (sirkel, trekant og firkant) inni knappen
  btn.innerHTML = `
    <div class="icon-col">
      <svg class="icon" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
      <svg class="icon" viewBox="0 0 100 100"><polygon points="50,0 100,100 0,100"/></svg>
      <svg class="icon" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100"/></svg>
    </div>
    <div class="input-icon">
      <input maxlength="1">
      <input maxlength="1">
      <input maxlength="1">
    </div>
  `;

  const inputs = btn.querySelectorAll("input");

  inputs.forEach((input, index) => {
    const key = `${i}-${index}`; // unik ID for hver rute og hvert felt

    // Sett lagret verdi om den finnes
    if (savedValues[key]) input.value = savedValues[key];


    input.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\D/g, ""); // kun tall
      e.target.value = value;

    
      if (value) {
        savedValues[key] = value;
      } else {
        delete savedValues[key];
      }
      saveBoard();


      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

  
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
  
        inputs[index - 1].focus();
        inputs[index - 1].value = "";
        delete savedValues[`${i}-${index - 1}`];
        saveBoard();
        e.preventDefault();
      }
    });
  });

  grid.appendChild(btn);
}
