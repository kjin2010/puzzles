# Puzzles

A small static site that hosts browser games. `index.html` lists every game as a
clickable tile; clicking one opens that game's own page.

## Adding a game

1. Create a directory under `games/<slug>/` containing the game's `index.html`
   (plus any CSS/JS/assets it needs) and a `README.md`.
2. In that `README.md`, the first `#` heading becomes the game's title on the
   homepage, and the first paragraph after it becomes the short description
   shown on the tile.
3. Add `"<slug>"` to the list in `games/games.json`.
4. Add a link back to the homepage from the game's page (see the `.back-link`
   element in `games/square-fit-puzzle/index.html` for an example).

Serve the repo with any static file server (e.g. `python3 -m http.server`) —
the homepage fetches `games/games.json` and each game's `README.md`, so it
won't work over a plain `file://` URL.
