// ---------------------------------------------------------------------------
// Square Fit — a rectangle-packing puzzle.
//
// A square of N x N cells is filled with rectangles: either cut out by a
// random guillotine-cut algorithm (auto mode), or typed in by hand as a list
// of "WxH, color, locked" lines that get fitted by a backtracking exact-cover
// solver (manual mode). Some pieces can be marked as locked "starters" — they
// are placed immediately and can't be moved; the rest scatter into a tray and
// you drag + rotate them to fill in what's left. Any piece you place can also
// be frozen in place with its lock badge, so you don't have to worry about
// bumping it while you work on the rest.
// ---------------------------------------------------------------------------

(function () {
  'use strict';

  // ---- DOM references -----------------------------------------------------
  const gridSizeInput = document.getElementById('gridSize');
  const pieceCountInput = document.getElementById('pieceCount');
  const pieceCountVal = document.getElementById('pieceCountVal');
  const lockCountInput = document.getElementById('lockCount');
  const lockCountVal = document.getElementById('lockCountVal');
  const generateBtn = document.getElementById('generateBtn');
  const buildBtn = document.getElementById('buildBtn');
  const manualShapes = document.getElementById('manualShapes');
  const manualError = document.getElementById('manualError');
  const resetBtn = document.getElementById('resetBtn');
  const hintToggle = document.getElementById('hintToggle');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const autoControls = document.getElementById('autoControls');
  const manualControls = document.getElementById('manualControls');

  const playfield = document.getElementById('playfield');
  const squareEl = document.getElementById('square');
  const hintLayer = document.getElementById('hintLayer');
  const trayScrollEl = document.getElementById('trayScroll');
  const trayContentEl = document.getElementById('trayContent');

  const timerEl = document.getElementById('timer');
  const movesEl = document.getElementById('moves');
  const remainingEl = document.getElementById('remaining');
  const lockedCountEl = document.getElementById('lockedCount');

  const winBanner = document.getElementById('winBanner');
  const winStats = document.getElementById('winStats');
  const playAgainBtn = document.getElementById('playAgainBtn');

  // ---- Named colors (for manual mode) ---------------------------------------
  const COLOR_NAMES = {
    red: '#d1453d', yellow: '#e8b93d', white: '#f6f3ea', blue: '#3f6fb0',
    grey: '#8d8577', gray: '#8d8577', green: '#4f9a52', orange: '#d9812f',
    purple: '#8656a8', pink: '#d97ba8', black: '#2b2823', brown: '#86593b',
    teal: '#3f9a94', cyan: '#46b8c2', navy: '#2c3f66', lime: '#9ac23f',
    magenta: '#b8438f', silver: '#b8b2a3', gold: '#d1a63d',
  };

  function contrastTextColor(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.62 ? '#23201a' : '#ffffff';
  }

  function colorForIndex(i, total) {
    const hue = Math.round((360 * i / Math.max(total, 1) + 17 * i) % 360);
    return `hsl(${hue} 60% 52%)`;
  }

  // ---- Geometry / state -----------------------------------------------------
  const MAX_SQUARE_PX = 560;
  const TRAY_WIDTH = 380;

  let gridSize = 8;
  let cellPx = 48;

  let pieces = [];         // {id,w,h,x,y,placed,locked,starter,gx,gy,el,color,textColor}
  let occupancy = [];       // gridSize x gridSize -> piece id or -1
  let solutionRects = null;  // hint overlay targets for the movable pieces

  let moves = 0;
  let startTime = null;
  let timerHandle = null;
  let gameActive = false;
  let zTop = 10;
  let mode = 'manual';

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function makeEmptyOccupancy(n) { return Array.from({ length: n }, () => new Array(n).fill(-1)); }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---- Auto-generation: random guillotine partition ---------------------------
  function generateAutoRects(n, targetPieces) {
    let rects = [{ x: 0, y: 0, w: n, h: n }];
    let guard = 0;
    while (rects.length < targetPieces && guard < targetPieces * 80) {
      guard++;
      const splittableIdx = [];
      for (let i = 0; i < rects.length; i++) {
        if (rects[i].w >= 2 || rects[i].h >= 2) splittableIdx.push(i);
      }
      if (splittableIdx.length === 0) break;
      const idx = splittableIdx[Math.floor(Math.random() * splittableIdx.length)];
      const r = rects[idx];
      const canVert = r.w >= 2;
      const canHoriz = r.h >= 2;
      let vertical;
      if (canVert && canHoriz) vertical = Math.random() < (r.w >= r.h ? 0.6 : 0.4);
      else vertical = canVert;

      if (vertical) {
        const cut = 1 + Math.floor(Math.random() * (r.w - 1));
        rects.splice(idx, 1,
          { x: r.x, y: r.y, w: cut, h: r.h },
          { x: r.x + cut, y: r.y, w: r.w - cut, h: r.h });
      } else {
        const cut = 1 + Math.floor(Math.random() * (r.h - 1));
        rects.splice(idx, 1,
          { x: r.x, y: r.y, w: r.w, h: cut },
          { x: r.x, y: r.y + cut, w: r.w, h: r.h - cut });
      }
    }
    return rects;
  }

  // ---- Manual mode: parse "WxH, color, locked[@x-y]" lines -------------------
  function parseCustomShapes(text, n) {
    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) return { error: 'Enter at least one piece, like "3x4, blue".' };
    const shapes = [];
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim()).filter(Boolean);
      const dimMatch = parts[0] && parts[0].match(/^(\d+)\s*[x×X]\s*(\d+)$/);
      if (!dimMatch) return { error: `Couldn't parse "${line}" — start each line with W x H, e.g. "3x4, blue".` };
      const a = parseInt(dimMatch[1], 10), b = parseInt(dimMatch[2], 10);
      if (a <= 0 || b <= 0 || a > n || b > n) {
        return { error: `Piece ${a}x${b} doesn't fit in a ${n}x${n} square.` };
      }
      let locked = false, fixedX = null, fixedY = null, color = null, colorName = null;
      for (let i = 1; i < parts.length; i++) {
        const tok = parts[i].toLowerCase();
        if (tok === 'locked') { locked = true; continue; }
        const m = tok.match(/^locked@(\d+)-(\d+)$/);
        if (m) { locked = true; fixedX = parseInt(m[1], 10); fixedY = parseInt(m[2], 10); continue; }
        if (COLOR_NAMES[tok]) { color = COLOR_NAMES[tok]; colorName = tok; continue; }
        return { error: `Couldn't understand "${parts[i]}" in "${line}" — use a color name or "locked".` };
      }
      if (fixedX !== null && (fixedX < 0 || fixedY < 0 || fixedX + a > n || fixedY + b > n)) {
        return { error: `Locked position for ${a}x${b} at (${fixedX},${fixedY}) doesn't fit in the ${n}x${n} square.` };
      }
      shapes.push({ a, b, locked, fixedX, fixedY, color, colorName });
    }
    const sumArea = shapes.reduce((s, r) => s + r.a * r.b, 0);
    if (sumArea !== n * n) {
      return { error: `Piece areas sum to ${sumArea}, but a ${n}x${n} square needs ${n * n}.` };
    }
    // Fixed-position pieces must not overlap each other.
    const mask = makeEmptyOccupancy(n);
    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];
      if (s.fixedX === null) continue;
      for (let yy = s.fixedY; yy < s.fixedY + s.b; yy++) {
        for (let xx = s.fixedX; xx < s.fixedX + s.a; xx++) {
          if (mask[yy][xx] !== -1) return { error: `Locked pieces overlap at (${xx},${yy}).` };
          mask[yy][xx] = i;
        }
      }
    }
    if (n > 16 && shapes.length > 26) {
      return { error: `That's a lot to solve at once — try a smaller grid or fewer pieces.` };
    }
    return { shapes };
  }

  // shapes: [{a,b,fixedX,fixedY,...}]. Pieces with fixedX/fixedY are placed
  // before the search starts (fixed orientation a x b); the rest are searched
  // over both orientations. Returns placements[] aligned to shape index, or
  // null / 'timeout'.
  function solveExactCover(n, shapes) {
    const grid = makeEmptyOccupancy(n);
    const used = new Array(shapes.length).fill(false);
    const placements = new Array(shapes.length).fill(null);
    const freeIds = [];

    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];
      if (s.fixedX !== null) {
        for (let j = 0; j < s.b; j++) {
          for (let k = 0; k < s.a; k++) grid[s.fixedY + j][s.fixedX + k] = i;
        }
        used[i] = true;
        placements[i] = { x: s.fixedX, y: s.fixedY, w: s.a, h: s.b };
      } else {
        freeIds.push(i);
      }
    }

    let nodeBudget = 2000000;

    function findEmptyCell() {
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          if (grid[y][x] === -1) return [x, y];
        }
      }
      return null;
    }

    function canPlace(x, y, w, h) {
      if (x + w > n || y + h > n) return false;
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          if (grid[y + j][x + i] !== -1) return false;
        }
      }
      return true;
    }

    function setCells(x, y, w, h, val) {
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) grid[y + j][x + i] = val;
      }
    }

    function backtrack() {
      if (nodeBudget-- <= 0) return 'timeout';
      const cell = findEmptyCell();
      if (!cell) return true;
      const [x, y] = cell;
      const order = freeIds.filter(i => !used[i])
        .sort((i, j) => (shapes[j].a * shapes[j].b) - (shapes[i].a * shapes[i].b));
      for (const id of order) {
        const { a, b } = shapes[id];
        const orientations = a === b ? [[a, b]] : [[a, b], [b, a]];
        for (const [w, h] of orientations) {
          if (canPlace(x, y, w, h)) {
            setCells(x, y, w, h, id);
            used[id] = true;
            placements[id] = { x, y, w, h };
            const result = backtrack();
            if (result === true) return true;
            if (result === 'timeout') return 'timeout';
            used[id] = false;
            setCells(x, y, w, h, -1);
            placements[id] = null;
          }
        }
      }
      return false;
    }

    const result = backtrack();
    if (result === true) return placements;
    if (result === 'timeout') return 'timeout';
    return null;
  }

  // ---- Board setup --------------------------------------------------------
  function computeGeometry(n) {
    gridSize = n;
    cellPx = clamp(Math.floor(MAX_SQUARE_PX / n), 18, 64);
    const squarePx = cellPx * n;

    squareEl.style.width = squarePx + 'px';
    squareEl.style.height = squarePx + 'px';
    squareEl.style.backgroundSize = `${cellPx}px ${cellPx}px`;

    hintLayer.style.width = squarePx + 'px';
    hintLayer.style.height = squarePx + 'px';

    // The tray gets its own fixed-height, independently scrollable viewport
    // sized to match the square, so scrolling through pieces never scrolls
    // the board itself out of view.
    trayScrollEl.style.width = TRAY_WIDTH + 'px';
    trayScrollEl.style.height = Math.max(squarePx, 320) + 'px';
  }

  // shapeDefs: [{a,b,color?}]; lockedFlags: parallel array of booleans;
  // placements: parallel array of {x,y,w,h} — the position each piece starts
  // at (locked) or targets (hint, for movable pieces).
  function buildPuzzle(n, shapeDefs, lockedFlags, placements) {
    clearPieces();
    occupancy = makeEmptyOccupancy(n);

    const total = shapeDefs.length;
    const order = shuffle(shapeDefs.map((_, i) => i));
    let colorCursor = 0;

    pieces = order.map((idx) => {
      const def = shapeDefs[idx];
      const locked = !!lockedFlags[idx];
      const place = placements[idx];
      const color = def.color || colorForIndex(colorCursor++, total);
      const rotated = !locked && Math.random() < 0.5;
      const p = {
        id: idx,
        a: def.a, b: def.b,
        w: locked ? place.w : (rotated ? def.b : def.a),
        h: locked ? place.h : (rotated ? def.a : def.b),
        x: 0, y: 0,
        placed: locked,
        locked: locked,
        starter: locked,
        gx: locked ? place.x : -1,
        gy: locked ? place.y : -1,
        color,
        textColor: contrastTextColor(color),
        el: null,
      };
      if (locked) {
        p.x = p.gx * cellPx;
        p.y = p.gy * cellPx;
        p.homeGx = p.gx; p.homeGy = p.gy;
        p.homeW = p.w; p.homeH = p.h;
      }
      return p;
    });

    pieces.filter(p => p.locked).forEach(p => writeOccupancy(p, p.gx, p.gy, p.id));
    solutionRects = pieces.filter(p => !p.locked).map(p => placements[p.id]).filter(Boolean);

    layoutTray();
    pieces.forEach(createPieceElement);
    renderHint();
    resetStats();
    gameActive = true;
    updateStatsLabels();
  }

  function layoutTray() {
    // Simple shelf packing so movable pieces start non-overlapping in the
    // tray, in coordinates local to #trayContent (independent of the square).
    const pad = 10;
    let x = pad, y = pad, shelfH = 0;
    const maxW = TRAY_WIDTH - pad;
    for (const p of pieces) {
      if (p.locked) continue;
      const w = p.w * cellPx, h = p.h * cellPx;
      if (x + w > maxW && x > pad) {
        x = pad;
        y += shelfH + pad;
        shelfH = 0;
      }
      p.x = x;
      p.y = y;
      x += w + pad;
      shelfH = Math.max(shelfH, h);
    }
    growTrayIfNeeded();
  }

  // Ensures #trayContent is tall enough to contain every tray piece, growing
  // its scrollable height as pieces land further down (via drag or rotation).
  function growTrayIfNeeded() {
    let maxBottom = trayScrollEl.clientHeight;
    pieces.forEach(p => {
      if (!p.placed) maxBottom = Math.max(maxBottom, p.y + p.h * cellPx + 10);
    });
    trayContentEl.style.height = maxBottom + 'px';
  }

  function clearPieces() {
    pieces.forEach(p => { if (p.el) p.el.remove(); });
    pieces = [];
  }

  function renderHint() {
    hintLayer.innerHTML = '';
    if (!solutionRects) return;
    for (const r of solutionRects) {
      const div = document.createElement('div');
      div.className = 'hint-rect';
      div.style.left = (r.x * cellPx) + 'px';
      div.style.top = (r.y * cellPx) + 'px';
      div.style.width = (r.w * cellPx) + 'px';
      div.style.height = (r.h * cellPx) + 'px';
      hintLayer.appendChild(div);
    }
    hintLayer.style.display = hintToggle.checked ? 'block' : 'none';
  }

  // ---- Piece element + drag handling ---------------------------------------
  function createPieceElement(p) {
    const el = document.createElement('div');
    el.className = 'piece';
    el.style.background = p.color;
    el.style.color = p.textColor;

    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'lock-badge';
    badge.addEventListener('pointerdown', e => e.stopPropagation());
    badge.addEventListener('click', e => {
      e.stopPropagation();
      toggleLock(p);
    });
    el.appendChild(badge);
    p.badgeEl = badge;

    (p.placed ? squareEl : trayContentEl).appendChild(el);
    p.el = el;
    updatePieceVisual(p);
    el.addEventListener('pointerdown', (e) => onPointerDown(e, p));
  }

  // Moves a piece's element into its resting container (the square if
  // placed, the tray otherwise) and lets CSS govern absolute positioning
  // again after a drag temporarily switched it to fixed/body-attached.
  function attachPieceToContainer(p, container) {
    p.el.style.position = '';
    container.appendChild(p.el);
  }

  function updatePieceVisual(p) {
    const el = p.el;
    el.style.width = (p.w * cellPx - 4) + 'px';
    el.style.height = (p.h * cellPx - 4) + 'px';
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.style.textShadow = p.textColor === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.35)' : 'none';
    el.textContent = '';
    const label = document.createElement('span');
    label.textContent = `${p.w}×${p.h}`;
    el.appendChild(label);
    el.appendChild(p.badgeEl);
    el.classList.toggle('placed-piece', p.placed);
    el.classList.toggle('locked-piece', p.locked);
    el.classList.toggle('starter-piece', p.starter);

    if (p.placed) {
      p.badgeEl.classList.remove('hidden');
      p.badgeEl.disabled = false;
      p.badgeEl.textContent = p.locked ? '🔒' : '🔓';
    } else {
      p.badgeEl.classList.add('hidden');
    }
  }

  function toggleLock(p) {
    if (!p.placed) return;
    p.locked = !p.locked;
    updatePieceVisual(p);
    updateStatsLabels();
  }

  function occupancyFits(p, gx, gy) {
    if (gx < 0 || gy < 0 || gx + p.w > gridSize || gy + p.h > gridSize) return false;
    for (let j = 0; j < p.h; j++) {
      for (let i = 0; i < p.w; i++) {
        const v = occupancy[gy + j][gx + i];
        if (v !== -1 && v !== p.id) return false;
      }
    }
    return true;
  }

  function writeOccupancy(p, gx, gy, val) {
    for (let j = 0; j < p.h; j++) {
      for (let i = 0; i < p.w; i++) occupancy[gy + j][gx + i] = val;
    }
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // Dragging reparents the piece to <body> as a position:fixed element using
  // viewport coordinates, so it can float freely over both the square and the
  // independently-scrolling tray without being clipped or needing coordinate
  // translation. It's reparented back into the square or the tray on drop.
  let drag = null; // {p, offX, offY, startClientX, startClientY, moved, target}

  function onPointerDown(e, p) {
    if (!gameActive || p.locked) return;
    e.preventDefault();
    const rect = p.el.getBoundingClientRect();
    drag = {
      p,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      startClientX: e.clientX,
      startClientY: e.clientY,
      moved: false,
      target: null,
    };
    if (p.placed) writeOccupancy(p, p.gx, p.gy, -1);

    p.el.style.position = 'fixed';
    p.el.style.left = rect.left + 'px';
    p.el.style.top = rect.top + 'px';
    document.body.appendChild(p.el);

    p.el.classList.add('dragging');
    p.el.style.zIndex = ++zTop;
    p.el.setPointerCapture(e.pointerId);
    p.el.addEventListener('pointermove', onPointerMove);
    p.el.addEventListener('pointerup', onPointerUp);
    p.el.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
    if (!drag.moved) return;

    const p = drag.p;
    const rawX = e.clientX - drag.offX;
    const rawY = e.clientY - drag.offY;
    const pieceW = p.w * cellPx, pieceH = p.h * cellPx;
    const squareRect = squareEl.getBoundingClientRect();

    const overlapsSquare = rectsOverlap(rawX, rawY, pieceW, pieceH,
      squareRect.left, squareRect.top, squareRect.width, squareRect.height);

    p.el.classList.remove('valid-drop', 'invalid-drop');

    if (overlapsSquare) {
      let gx = Math.round((rawX - squareRect.left) / cellPx);
      let gy = Math.round((rawY - squareRect.top) / cellPx);
      gx = clamp(gx, 0, gridSize - p.w);
      gy = clamp(gy, 0, gridSize - p.h);
      const fits = occupancyFits(p, gx, gy);
      drag.target = fits ? { gx, gy } : null;
      if (fits) {
        p.el.style.left = (squareRect.left + gx * cellPx) + 'px';
        p.el.style.top = (squareRect.top + gy * cellPx) + 'px';
        p.el.classList.add('valid-drop');
      } else {
        p.el.style.left = rawX + 'px';
        p.el.style.top = rawY + 'px';
        p.el.classList.add('invalid-drop');
      }
    } else {
      drag.target = null;
      p.el.style.left = rawX + 'px';
      p.el.style.top = rawY + 'px';
    }
  }

  function onPointerUp(e) {
    if (!drag) return;
    const p = drag.p;
    p.el.classList.remove('dragging', 'valid-drop', 'invalid-drop');
    p.el.removeEventListener('pointermove', onPointerMove);
    p.el.removeEventListener('pointerup', onPointerUp);
    p.el.removeEventListener('pointercancel', onPointerUp);

    if (!drag.moved) {
      // A click, not a drag: put it back exactly where it was, then rotate.
      attachPieceToContainer(p, p.placed ? squareEl : trayContentEl);
      updatePieceVisual(p);
      if (p.placed) writeOccupancy(p, p.gx, p.gy, p.id);
      rotatePiece(p);
      drag = null;
      return;
    }

    if (drag.target) {
      writeOccupancy(p, drag.target.gx, drag.target.gy, p.id);
      p.gx = drag.target.gx;
      p.gy = drag.target.gy;
      p.placed = true;
      p.x = p.gx * cellPx;
      p.y = p.gy * cellPx;
      attachPieceToContainer(p, squareEl);
      moves++;
      movesEl.textContent = String(moves);
    } else {
      p.placed = false;
      p.gx = -1; p.gy = -1;
      p.locked = false;

      const trayRect = trayContentEl.getBoundingClientRect();
      const pieceW = p.w * cellPx, pieceH = p.h * cellPx;
      const curLeft = parseFloat(p.el.style.left) || 0;
      const curTop = parseFloat(p.el.style.top) || 0;
      let localX = curLeft - trayRect.left + trayScrollEl.scrollLeft;
      let localY = curTop - trayRect.top + trayScrollEl.scrollTop;
      localX = clamp(localX, 0, Math.max(0, trayContentEl.clientWidth - pieceW));
      localY = Math.max(0, localY);
      p.x = localX;
      p.y = localY;
      attachPieceToContainer(p, trayContentEl);
      growTrayIfNeeded();
    }
    updatePieceVisual(p);
    updateStatsLabels();
    checkWin();
    drag = null;
  }

  function rotatePiece(p) {
    const newW = p.h, newH = p.w;
    if (p.placed) {
      let fits = true;
      if (p.gx + newW > gridSize || p.gy + newH > gridSize) fits = false;
      else {
        for (let j = 0; j < newH && fits; j++) {
          for (let i = 0; i < newW; i++) {
            const v = occupancy[p.gy + j][p.gx + i];
            if (v !== -1 && v !== p.id) { fits = false; break; }
          }
        }
      }
      if (!fits) {
        p.el.classList.add('invalid-drop');
        setTimeout(() => p.el.classList.remove('invalid-drop'), 220);
        return;
      }
      writeOccupancy(p, p.gx, p.gy, -1);
      p.w = newW; p.h = newH;
      writeOccupancy(p, p.gx, p.gy, p.id);
    } else {
      p.w = newW; p.h = newH;
      p.x = clamp(p.x, 0, Math.max(0, trayContentEl.clientWidth - p.w * cellPx));
      p.y = Math.max(0, p.y);
      growTrayIfNeeded();
    }
    updatePieceVisual(p);
    checkWin();
  }

  // ---- Stats / win ----------------------------------------------------------
  function resetStats() {
    moves = 0;
    startTime = Date.now();
    movesEl.textContent = '0';
    timerEl.textContent = '0:00';
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = setInterval(updateTimer, 250);
    winBanner.classList.add('hidden');
  }

  function updateTimer() {
    if (!startTime) return;
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(secs / 60), s = secs % 60;
    timerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }

  function updateStatsLabels() {
    remainingEl.textContent = String(pieces.filter(p => !p.placed).length);
    lockedCountEl.textContent = String(pieces.filter(p => p.locked).length);
  }

  function checkWin() {
    if (!gameActive) return;
    if (pieces.length > 0 && pieces.every(p => p.placed)) {
      gameActive = false;
      clearInterval(timerHandle);
      winStats.textContent = `${pieces.length} pieces, ${moves} moves, ${timerEl.textContent} elapsed.`;
      winBanner.classList.remove('hidden');
    }
  }

  // ---- Puzzle generation entry points ---------------------------------------
  function startAutoPuzzle() {
    manualError.textContent = '';
    const n = clamp(parseInt(gridSizeInput.value, 10) || 10, 4, 24);
    gridSizeInput.value = n;
    const count = clamp(parseInt(pieceCountInput.value, 10) || 12, 2, 40);
    const lockN = clamp(parseInt(lockCountInput.value, 10) || 0, 0, count);
    computeGeometry(n);

    const rects = generateAutoRects(n, count);
    const lockedIdx = new Set(shuffle(rects.map((_, i) => i)).slice(0, lockN));
    const shapeDefs = rects.map(r => ({ a: r.w, b: r.h }));
    const lockedFlags = rects.map((_, i) => lockedIdx.has(i));
    const placements = rects.map(r => ({ x: r.x, y: r.y, w: r.w, h: r.h }));
    buildPuzzle(n, shapeDefs, lockedFlags, placements);
  }

  function startManualPuzzle() {
    manualError.textContent = '';
    const n = clamp(parseInt(gridSizeInput.value, 10) || 10, 4, 24);
    gridSizeInput.value = n;
    const parsed = parseCustomShapes(manualShapes.value, n);
    if (parsed.error) {
      manualError.textContent = parsed.error;
      return;
    }
    buildBtn.disabled = true;
    buildBtn.textContent = 'Solving…';
    setTimeout(() => {
      const placements = solveExactCover(n, parsed.shapes);
      buildBtn.disabled = false;
      buildBtn.textContent = 'Build puzzle';
      if (placements === 'timeout') {
        manualError.textContent = 'That took too long to solve — try a smaller grid or fewer/larger pieces.';
        return;
      }
      if (!placements) {
        manualError.textContent = 'No arrangement fits these exact shapes (and any locked positions) into that square. Try different pieces.';
        return;
      }
      computeGeometry(n);
      const shapeDefs = parsed.shapes.map(s => ({ a: s.a, b: s.b, color: s.color }));
      const lockedFlags = parsed.shapes.map(s => s.locked);
      buildPuzzle(n, shapeDefs, lockedFlags, placements);
    }, 10);
  }

  function resetCurrentPieces() {
    if (pieces.length === 0) return;
    occupancy = makeEmptyOccupancy(gridSize);
    shuffle(pieces);
    pieces.forEach(p => {
      if (p.starter) {
        // Snap starters back to their original locked position/orientation,
        // in case they were unlocked and dragged elsewhere.
        p.w = p.homeW; p.h = p.homeH;
        p.gx = p.homeGx; p.gy = p.homeGy;
        p.placed = true;
        p.locked = true;
        p.x = p.gx * cellPx;
        p.y = p.gy * cellPx;
        writeOccupancy(p, p.gx, p.gy, p.id);
      } else {
        p.placed = false;
        p.locked = false;
        p.gx = -1; p.gy = -1;
        if (Math.random() < 0.5) { const t = p.w; p.w = p.h; p.h = t; }
      }
      attachPieceToContainer(p, p.placed ? squareEl : trayContentEl);
    });
    layoutTray();
    pieces.forEach(updatePieceVisual);
    resetStats();
    gameActive = true;
    updateStatsLabels();
  }

  // ---- Wire up controls -------------------------------------------------------
  pieceCountInput.addEventListener('input', () => {
    pieceCountVal.textContent = pieceCountInput.value;
    lockCountInput.max = pieceCountInput.value;
  });
  lockCountInput.addEventListener('input', () => {
    lockCountVal.textContent = lockCountInput.value;
  });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      modeBtns.forEach(b => b.classList.toggle('active', b === btn));
      autoControls.classList.toggle('hidden', mode !== 'auto');
      manualControls.classList.toggle('hidden', mode !== 'manual');
    });
  });

  generateBtn.addEventListener('click', startAutoPuzzle);
  buildBtn.addEventListener('click', startManualPuzzle);
  resetBtn.addEventListener('click', resetCurrentPieces);
  playAgainBtn.addEventListener('click', () => {
    winBanner.classList.add('hidden');
    if (mode === 'auto') startAutoPuzzle(); else startManualPuzzle();
  });
  hintToggle.addEventListener('change', () => {
    hintLayer.style.display = hintToggle.checked ? 'block' : 'none';
  });

  // ---- Boot: preload the requested 8x8 starter configuration -------------------
  const DEFAULT_PUZZLE = [
    '4x3, yellow',
    '2x2, red',
    '2x4, white',
    '2x3, blue',
    '2x1, grey, locked',
    '2x5, yellow',
    '1x5, red',
    '3x3, white',
    '4x1, blue',
    '1x1, grey, locked',
    '1x3, grey, locked',
  ].join('\n');

  gridSizeInput.value = 8;
  manualShapes.value = DEFAULT_PUZZLE;
  startManualPuzzle();
})();
