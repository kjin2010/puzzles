// Homepage: lists every game registered in games/games.json, using each
// game's README.md for its title (first "# heading") and description
// (first paragraph after the heading).

async function loadGame(slug) {
  const res = await fetch(`games/${slug}/README.md`);
  if (!res.ok) throw new Error(`No README.md for ${slug}`);
  const text = await res.text();

  const lines = text.split(/\r?\n/);
  let title = slug;
  let description = "";

  const headingIdx = lines.findIndex((l) => l.trim().startsWith("#"));
  if (headingIdx !== -1) {
    title = lines[headingIdx].replace(/^#+\s*/, "").trim();
  }

  for (let i = headingIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      description = line;
      break;
    }
  }

  return { slug, title, description };
}

async function init() {
  const grid = document.getElementById("gameGrid");
  const emptyMsg = document.getElementById("emptyMsg");

  let slugs = [];
  try {
    const res = await fetch("games/games.json");
    slugs = await res.json();
  } catch (err) {
    console.error("Failed to load games/games.json", err);
  }

  const games = await Promise.all(
    slugs.map((slug) =>
      loadGame(slug).catch((err) => {
        console.error(err);
        return null;
      })
    )
  );

  const valid = games.filter(Boolean);
  if (valid.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }

  for (const game of valid) {
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = `games/${game.slug}/index.html`;

    const h2 = document.createElement("h2");
    h2.textContent = game.title;
    card.appendChild(h2);

    if (game.description) {
      const p = document.createElement("p");
      p.textContent = game.description;
      card.appendChild(p);
    }

    grid.appendChild(card);
  }
}

init();
