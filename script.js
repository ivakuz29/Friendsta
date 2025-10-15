const grid = document.getElementById("buttonGrid");

const size = 7;
const COLORS = {
  green: "#2ea44f",   // outer ring
  yellow: "#f2c230",  // 2nd ring
  orange: "#e67e22",  // 3rd ring
  red: "#c0392b"      // center
};

for (let i = 0; i < size * size; i++) {
  const btn = document.createElement("button");
  const row = Math.floor(i / size);
  const col = i % size;

  const d = Math.max(Math.abs(row - 3), Math.abs(col - 3));
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
  btn.classList.add("red");
}
btn.innerHTML = `
  <div class="icon-col">
    <svg class="icon" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>
    <svg class="icon" viewBox="0 0 100 100"><polygon points="50,0 100,100 0,100"/></svg>
    <svg class="icon" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100"/></svg>
  </div>
`;

  // no text → clean color squares
  grid.appendChild(btn);

  
}

