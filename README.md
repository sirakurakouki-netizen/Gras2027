# Gras2027 — Open Source Games

A static collection of open source browser games, hosted with GitHub Pages at
[gras2027.com](https://gras2027.com).

## Layout

| Path | Purpose |
|---|---|
| `index.html` | Main hub — the grid of game tiles |
| `tools.html` | About page |
| `styles.css` | Shared styles for the hub pages |
| `images/`, `imgs/` | Thumbnails and site images |
| `<game-name>/` | One folder per game, each with its own `index.html` entry point |
| Loose `*.html` at root (`maze.html`, `brick-breaker.html`, …) | Small single-file games |

A few notes:

- Game folders are self-contained copies; don't rename or move them — their
  paths are the live URLs.
- Some games (e.g. the Papa's series in `papas/`) embed the actual game from an
  external host in an iframe, so they need internet access to that host.
- `ruffle/` provides the Flash emulator used by Flash-based games.

## Run locally

```bash
python3 -m http.server 8801
```

Then open http://localhost:8801. Serving over HTTP matters — some games break
when opened via `file://`.

## Adding a game

1. Drop the game's folder at the repo root (entry point `<folder>/index.html`).
2. Add a thumbnail to `images/`.
3. Add a tile link inside a `.row` div in `index.html`.
