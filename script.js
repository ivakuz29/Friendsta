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

// Oppretter 49 (7x7) knapper på brettet
for (let i = 0; i < size * size; i++) {
  const btn = document.createElement("button");   // lager en knapp
  const row = Math.floor(i / size);               // regner ut radnummer
  const col = i % size;                           // regner ut kolonnenummer

  // Beregner avstanden fra midten (3,3)
  const d = Math.max(Math.abs(row - 3), Math.abs(col - 3));

  // Setter farge og kant etter hvilken ring knappen tilhører
  if (d === 3) {
    btn.style.backgroundColor = "white";
    btn.style.border = `4px solid ${COLORS.green}`;
  } else if (d === 2) {
    btn.style.backgroundColor = "white";
    btn.style.border = `4px solid ${COLORS.yellow}`;
  } else if (d === 1) {
    btn.style.backgroundColor = "white";
    btn.style.border = `4px solid ${COLORS.orange}`;
  } else {
    btn.style.backgroundColor = "white";
    btn.style.border = `4px solid ${COLORS.red}`;
    btn.classList.add("red"); // markerer midtruten som "rød"
  }

  // Legger til formene (sirkel, trekant og firkant) inni knappen
  btn.innerHTML = `
    <div class="icon-col">
      <svg class="icon" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
      <svg class="icon" viewBox="0 0 100 100"><polygon points="50,0 100,100 0,100"/></svg>
      <svg class="icon" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100"/></svg>
    </div>
  `;

  // Legger knappen inn i brettet (DOM-en)
  grid.appendChild(btn);
}
