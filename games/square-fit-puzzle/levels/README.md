# Levels

A level is a fixed puzzle: a set of pieces, some of which start locked in
place. Levels are loaded from the "Levels" tab in the game.

## Piece lists (`../piece-lists/*.json`)

A piece list is just the indexed shape inventory a level draws from —
independent of which ones end up locked or where, so the same list can be
reused by multiple levels.

```json
{
  "name": "Starter Mix (8x8, 11 pieces)",
  "pieces": [
    { "index": 0, "h": 3, "w": 4 },
    { "index": 1, "h": 2, "w": 2 }
  ]
}
```

`index` must be unique within the list; `h`/`w` are the piece's two side
lengths in cells (same numbers you'd type as `h, w` on the Manual shapes tab).

## Levels (`*.json`)

```json
{
  "name": "Starter Mix (8x8)",
  "gridSize": 8,
  "pieceList": "starter-mix-8x8",
  "locked": [
    { "index": 4, "x": 0, "y": 7, "orientation": "horizontal" },
    { "index": 10, "x": 2, "y": 5, "orientation": "vertical" }
  ]
}
```

- `pieceList` — filename (without `.json`) of a file in `../piece-lists/`.
- `locked` — one entry per piece that should start locked in place. Any
  piece from the list whose index isn't in here starts unlocked in the tray.
  - `index` — which piece (matches the piece list's `index`).
  - `x`, `y` — 0-indexed top-left cell.
  - `orientation` — `"horizontal"` (the piece's longer side runs left-right)
    or `"vertical"` (longer side runs top-to-bottom). Optional, defaults to
    `"horizontal"`; ignored for square pieces.

Piece areas must sum to `gridSize²`, and locked pieces must fit on the board
without overlapping — the game validates both, then runs a solver over the
unlocked pieces to confirm the level is actually completable before loading
it.

Finally, add the filename (without `.json`) to `levels.json` so it shows up
in the level picker.
