import React, { useMemo, useState } from "react";

/**
 * InnovationAccountingBoard (single-file React component)
 *
 * What you get:
 * - A configurable grid of tiles (default 9x9) similar to your board.
 * - Each tile shows three shapes stacked vertically: Circle (top), Triangle (middle), Square (bottom).
 * - Numbers sit *inside* each shape. Click to edit.
 * - Left‑click a shape: cycles 0→9 then blank. Right‑click: reverse cycle. Double‑click: open prompt to type a number.
 * - Keyboard input: with a shape selected, press 0–9 to set that value, Backspace to clear.
 * - Quick actions: Reset, Export/Import JSON, Toggle tile labels, Resize grid.
 * - Colors: outer ring = green, middle = yellow, center = red (auto-calculated by distance from center).
 */

export default function InnovationAccountingBoard() {
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const total = rows * cols;

  // board state: array of tiles; each tile has {c,t,s} for circle/triangle/square strings
  const emptyTile = { c: "", t: "", s: "" };
  const makeEmpty = () => Array.from({ length: total }, () => ({ ...emptyTile }));
  const [tiles, setTiles] = useState(makeEmpty);
  const [showCoords, setShowCoords] = useState(false);
  const [focusKey, setFocusKey] = useState(null); // `${idx}:${shape}`

  // Reinitialize when grid size changes
  const resize = (r, c) => {
    const nr = Math.max(1, Math.min(20, Number(r) || 1));
    const nc = Math.max(1, Math.min(20, Number(c) || 1));
    setRows(nr);
    setCols(nc);
    setTiles(() => Array.from({ length: nr * nc }, () => ({ ...emptyTile })));
  };

  // Color bands similar to the physical board
  const bandClassFor = (r, c) => {
    const cr = (rows - 1) / 2;
    const cc = (cols - 1) / 2;
    const dist = Math.max(Math.abs(r - cr), Math.abs(c - cc)); // Chebyshev radius
    const maxd = Math.max(cr, cc);
    const ratio = dist / maxd; // 0=center → 1=edge
    if (ratio <= 0.34) return "ring-red"; // center
    if (ratio <= 0.67) return "ring-yellow"; // mid
    return "ring-green"; // outer
  };

  const cycle = (val, dir = 1) => {
    const seq = ["", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let i = seq.indexOf(String(val));
    if (i === -1) i = 0;
    i = (i + dir + seq.length) % seq.length;
    return seq[i];
  };

  const setShape = (idx, key, value) => {
    setTiles((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const onShapeClick = (e, idx, key) => {
    e.preventDefault();
    const dir = e.type === "contextmenu" ? -1 : 1;
    setShape(idx, key, cycle(tiles[idx][key], dir));
    setFocusKey(`${idx}:${key}`);
  };

  const onShapeDouble = (idx, key) => {
    const v = window.prompt("Enter number 0–9 (blank to clear)", tiles[idx][key]);
    if (v === null) return;
    const cleaned = String(v).trim();
    if (cleaned === "") return setShape(idx, key, "");
    if (/^[0-9]$/.test(cleaned)) setShape(idx, key, cleaned);
  };

  const onKeyDown = (e) => {
    if (!focusKey) return;
    const [idxStr, key] = focusKey.split(":");
    const idx = Number(idxStr);
    if (/^[0-9]$/.test(e.key)) {
      setShape(idx, key, e.key);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      setShape(idx, key, "");
    } else if (e.key === "ArrowUp") {
      setFocusKey(`${Math.max(0, idx - cols)}:${key}`);
    } else if (e.key === "ArrowDown") {
      setFocusKey(`${Math.min(total - 1, idx + cols)}:${key}`);
    } else if (e.key === "ArrowLeft") {
      setFocusKey(`${Math.max(0, idx - 1)}:${key}`);
    } else if (e.key === "ArrowRight") {
      setFocusKey(`${Math.min(total - 1, idx + 1)}:${key}`);
    }
  };

  const exportJSON = () => {
    const payload = { rows, cols, tiles };
    navigator.clipboard.writeText(JSON.stringify(payload));
    alert("Copied board JSON to clipboard.");
  };

  const importJSON = () => {
    const raw = window.prompt("Paste board JSON");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data || !data.rows || !data.cols || !Array.isArray(data.tiles)) throw new Error("Invalid");
      setRows(data.rows);
      setCols(data.cols);
      setTiles(() => {
        const expected = data.rows * data.cols;
        const src = data.tiles.slice(0, expected);
        while (src.length < expected) src.push({ ...emptyTile });
        return src;
      });
    } catch (e) {
      alert("Couldn't import JSON: " + e.message);
    }
  };

  // Render one tile with three shapes stacked
  const Tile = ({ idx, r, c }) => {
    const val = tiles[idx];
    const band = bandClassFor(r, c);

    // focus helpers
    const isFocused = (shape) => focusKey === `${idx}:${shape}`;

    return (
      <div className={`tile ${band}`}>
        <div className="shape-row">
          <ShapeCircle
            value={val.c}
            focused={isFocused("c")}
            onClick={(e) => onShapeClick(e, idx, "c")}
            onContextMenu={(e) => onShapeClick(e, idx, "c")}
            onDoubleClick={() => onShapeDouble(idx, "c")}
            onFocus={() => setFocusKey(`${idx}:c`)}
          />
        </div>
        <div className="shape-row">
          <ShapeTriangle
            value={val.t}
            focused={isFocused("t")}
            onClick={(e) => onShapeClick(e, idx, "t")}
            onContextMenu={(e) => onShapeClick(e, idx, "t")}
            onDoubleClick={() => onShapeDouble(idx, "t")}
            onFocus={() => setFocusKey(`${idx}:t`)}
          />
        </div>
        <div className="shape-row">
          <ShapeSquare
            value={val.s}
            focused={isFocused("s")}
            onClick={(e) => onShapeClick(e, idx, "s")}
            onContextMenu={(e) => onShapeClick(e, idx, "s")}
            onDoubleClick={() => onShapeDouble(idx, "s")}
            onFocus={() => setFocusKey(`${idx}:s`)}
          />
        </div>
        {showCoords && (
          <div className="coords">{r + 1},{c + 1}</div>
        )}
      </div>
    );
  };

  // Build grid
  const grid = useMemo(() => {
    return Array.from({ length: rows }).map((_, r) => (
      <div className="row" key={r}>
        {Array.from({ length: cols }).map((__, c) => {
          const idx = r * cols + c;
          return <Tile key={idx} idx={idx} r={r} c={c} />;
        })}
      </div>
    ));
  }, [rows, cols, tiles, focusKey, showCoords]);

  return (
    <div className="ia-root" tabIndex={0} onKeyDown={onKeyDown}>
      <header className="toolbar">
        <div className="title">Innovation Accounting – Digital Board</div>
        <div className="controls">
          <label className="control">
            Rows
            <input
              type="number"
              min={1}
              max={20}
              value={rows}
              onChange={(e) => resize(e.target.value, cols)}
              title="Rows"
            />
          </label>
          <label className="control">
            Cols
            <input
              type="number"
              min={1}
              max={20}
              value={cols}
              onChange={(e) => resize(rows, e.target.value)}
              title="Columns"
            />
          </label>
          <button className="btn" onClick={() => setTiles(makeEmpty())}>Reset</button>
          <button className="btn" onClick={exportJSON}>Export JSON</button>
          <button className="btn" onClick={importJSON}>Import JSON</button>
          <label className="toggle">
            <input type="checkbox" checked={showCoords} onChange={(e) => setShowCoords(e.target.checked)} />
            <span>Tile coords</span>
          </label>
        </div>
      </header>

      <main className="board" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {grid}
      </main>

      <footer className="hint">
        <p>
          Tips: Left‑click cycles 0→9→blank. Right‑click cycles backward. Double‑click to type a number. Use arrow keys to move focus; 0–9 to set; Backspace to clear.
        </p>
      </footer>

      {/* Inline styles for a self‑contained component (Tailwind‑ish look without dependency) */}
      <style>{`
        .ia-root { --gap: 6px; --tile: 64px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 12px; color: #0f172a; }
        .toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; flex-wrap:wrap; }
        .title { font-weight:700; font-size: 18px; }
        .controls { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .control { display:flex; align-items:center; gap:6px; font-size:14px; }
        .control input { width:64px; padding:6px 8px; border:1px solid #cbd5e1; border-radius:10px; }
        .btn { padding:6px 10px; border-radius:12px; border:1px solid #cbd5e1; background:#fff; cursor:pointer; }
        .btn:hover { background:#f8fafc; }
        .toggle { display:flex; align-items:center; gap:6px; font-size:14px; }

        .board { display:grid; gap: var(--gap); }
        .row { display:grid; grid-template-columns: repeat(${cols}, 1fr); gap: var(--gap); }
        .tile { position:relative; width: var(--tile); height: var(--tile); background: white; border-radius: 10px; box-shadow: inset 0 0 0 2px #e2e8f0; display:flex; flex-direction:column; justify-content:space-between; padding:6px; }
        .tile.ring-green { box-shadow: inset 0 0 0 2px #16a34a; }
        .tile.ring-yellow { box-shadow: inset 0 0 0 2px #eab308; }
        .tile.ring-red { box-shadow: inset 0 0 0 2px #ef4444; }
        .shape-row { display:flex; align-items:center; justify-content:center; height: 1fr; }
        .shape { width: 85%; height: 85%; display:flex; align-items:center; justify-content:center; user-select:none; cursor:pointer; outline: none; }
        .shape svg { width: 100%; height: 100%; display:block; }
        .num { font-weight:700; font-size: 14px; fill: #0f172a; dominant-baseline: middle; text-anchor: middle; }
        .focused { filter: drop-shadow(0 0 0.25rem rgba(2,132,199,0.6)); }
        .coords { position:absolute; right:6px; bottom:4px; font-size:10px; color:#64748b; }
        .hint { margin-top: 10px; color:#475569; font-size: 12px; }
        @media (max-width: 900px) { .ia-root { --tile: 46px; } }
      `}</style>
    </div>
  );
}

function ShapeCircle({ value, onClick, onContextMenu, onDoubleClick, onFocus, focused }) {
  return (
    <button className={`shape ${focused ? "focused" : ""}`} onClick={onClick} onContextMenu={onContextMenu} onDoubleClick={onDoubleClick} onFocus={onFocus} aria-label="Circle">
      <svg viewBox="0 0 100 100" role="img">
        <circle cx="50" cy="50" r="44" stroke="#94a3b8" strokeWidth="6" fill="none" />
        <text x="50" y="53" className="num">{value}</text>
      </svg>
    </button>
  );
}

function ShapeTriangle({ value, onClick, onContextMenu, onDoubleClick, onFocus, focused }) {
  return (
    <button className={`shape ${focused ? "focused" : ""}`} onClick={onClick} onContextMenu={onContextMenu} onDoubleClick={onDoubleClick} onFocus={onFocus} aria-label="Triangle">
      <svg viewBox="0 0 100 100" role="img">
        <polygon points="50,6 94,94 6,94" stroke="#94a3b8" strokeWidth="6" fill="none" />
        <text x="50" y="66" className="num">{value}</text>
      </svg>
    </button>
  );
}

function ShapeSquare({ value, onClick, onContextMenu, onDoubleClick, onFocus, focused }) {
  return (
    <button className={`shape ${focused ? "focused" : ""}`} onClick={onClick} onContextMenu={onContextMenu} onDoubleClick={onDoubleClick} onFocus={onFocus} aria-label="Square">
      <svg viewBox="0 0 100 100" role="img">
        <rect x="6" y="6" width="88" height="88" stroke="#94a3b8" strokeWidth="6" fill="none" rx="8" ry="8" />
        <text x="50" y="55" className="num">{value}</text>
      </svg>
    </button>
  );
}
