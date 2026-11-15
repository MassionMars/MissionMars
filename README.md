# MISSION: MARS

A small Mars base trainer for the NASA Space Apps Challenge "Build a Junior Astronaut Mission Trainer".
You run the Mars Dune Alpha base: you pick a room, face a crisis, choose a plan and win it in a short mini-game.
Every decision has a price, and the QR cards explain the real NASA technology behind each choice.

The full idea (a larger hybrid game with physical cards and a walkable 3D base) is a concept for later.
This repository contains the playable prototype and the knowledge cards.

Live demo: _add the GitHub Pages link here_

## Run it

Easiest: open the live demo. It installs as an app and then works without internet.

On your computer:

    start.bat        (Windows)
    ./start.sh       (macOS / Linux)

Both start a local server on http://localhost:8000 and need only Python 3.
They serve `dist/` if you built it, otherwise `site/`.

## What is inside

    site/      the website (plain HTML, CSS and JavaScript, no build step needed)
    tools/     Python helpers that prepare assets, check the project and build dist/
    dist/      build output (created by tools/build.py, not committed)

The game is **Mars Dune Alpha** (`site/dune/`, see below). Site texts are in `site/content.js` (EN, RU, TJ),
and the 48 QR topics in `site/qrdata.js`.

## Working offline

- `site/assets/vendor/qrcode.js` draws QR codes locally.
- Photos and the Rubik font are stored in `site/assets/` after you run the fetch script.
- `site/sw.js` caches everything on the first visit. `tools/build.py` stamps it with a version
  so visitors get updates.
- If a photo is missing, a placeholder is shown instead of an empty box.

## Tools

Install once: `pip install -r requirements.txt`

| Step | Command | Result |
|---|---|---|
| 1 | `python tools/fetch_assets.py fonts` | Rubik font in `site/assets/fonts/` |
| 2 | `python tools/fetch_assets.py images` | candidate NASA photos in `tools/cache/raw/` and a `review.html` sheet |
| 3 | look at `tools/cache/review.html`, delete the files you do not want | |
| 4 | `python tools/optimize_images.py` | WebP files in `site/assets/img/`, `images.js`, `ATTRIBUTION.md` |
| 5 | `python tools/check.py` | translation, topic, link and file checks |
| 6 | `python tools/build.py` | `dist/` with a versioned service worker |
| | `python tools/make_cards.py --url https://NAME.github.io/REPO/` | printable QR cards in `tools/out/cards.pdf` |
| | `python tools/make_icons.py` | app icons |

Photo credits are copied from the NASA Image and Video Library metadata. Check the source link before reusing a picture.

## Publishing on GitHub Pages

Settings -> Pages -> Source: GitHub Actions. The workflow in `.github/workflows/pages.yml`
runs the checks, builds `dist/` and deploys it on every push to `main`.

## Team and AI use

We are three people. The idea, the story, the mechanics, the balance and the fact checking are ours.
We wrote and reviewed parts of the code ourselves and used AI assistants (Claude, Gemini, ChatGPT)
for code, translations and visuals. The same is stated on the About page of the site.

_Fill in who did what: name, role, what they built._

## Security notes

_Add the findings of your review here (external scripts, localStorage use, input handling)._

## Photo database in the QR cards

Every QR card has a **Database** button. It opens a full-screen story: one slide per photo (caption, what you see, credit), a "Did you know?" fact and a three-option mini quiz. Texts are in en, ru and tg.

- `site/media.js`, `media2.js`, `media3.js` hold the slides and quizzes, one `MEDIA_ADD("code", [slides], quiz)` call per topic. A slide is `[photo id, title, text]`, a photo id is a file name without extension (`101-1`).
- `site/vault.js` and `site/vault.css` draw the viewer. Quiz results are kept in the browser (`mm-vault`).
- A photo can be used by several topics. Photos that no slide uses yet (for example freshly fetched ones) are appended to their topic automatically with an English caption.
- `python tools/check.py` checks that every slide has all five languages, that every photo exists and that every quiz has three options.
- `exclude` in `tools/config.json` lists photos that `optimize_images.py` must skip.
- tg texts were written without a native speaker. Please have them read before the jury sees them.

## Home screen

The planet on the home screen is NASA/JPL's global colour image of Mars (`site/assets/mars-disc.webp`). The intro is a generated render: the surface features (Olympus Mons, Valles Marineris, Hellas, Argyre, polar caps) are placed at their real positions. The only moon in it is Phobos, drawn small, dark and irregular at its real distance (2.77 Mars radii); its size is exaggerated about 9 times so it stays visible. There is no Earth or Moon in the picture because they would not be visible from this distance.

## Known limits

- Tajik texts were translated with AI and still need a native speaker.
- Dates and plans for Artemis and similar programs change, so check them on nasa.gov before presenting.
- There is no in-browser QR scanner yet. Codes can be typed in, and the printed QR opens the topic with a phone camera.

## The game: Mars Dune Alpha

One game made of three pages that share one state: the **base** (greenhouse and medbay rooms, with the base picture and the four room buttons),
the **laboratory** and the **airlock**. Each room has two crises (1A/1B, 2A/2B, 3A/3B, 4A/4B); each crisis offers two plans, each plan is a short
mini-game. A win changes the shared resources (life, energy, shield, science) and is counted in the strip "Crises: n / 8"; all 8 solved shows a finale.

- Files: `site/dune/hub.*`, `lab.*`, `airlock.*` (html + js + css each), `dune.css` (the Tailwind utilities the games use, compiled once, so no CDN is needed),
  `dune-bridge.js` (shared state in `localStorage["mm-dune"]`, solved crises, room switching, the progress strip).
- The site page `#p-game` (`site/dune-host.js`, `dune-host.css`) shows the games in one frame and switches rooms when a room asks for it
  (`DuneBridge.go('lab')`). A frame is used so the games keep their own styles and function names.
- **Languages**: English, Russian, Tajik (Italian and Chinese were removed). The game text is written in Russian; `dune/dune-dict.js` maps it (numbers as `{n}`) to
  English and Tajik and `dune/dune-i18n.js` translates text nodes, attributes and canvas text, so buttons, mini-game screens, result cards and canvas labels
  follow the site language. A new Russian string in a game page needs one line in the dictionary.
- **Look**: `dune/dune-skin.css` (glossy convex panels, grain, vignette, dust motes, animated SVG resource icons built in `dune-bridge.js`) and `site/skin.css` for the site.
  Mechanics are untouched. Astronauts walk on the Martian ground of the base and leave footprints that fade (`DuneBridge.walkers`), the lab and the airlock have their own.
- **Audio**: `site/music.js` plays an original ambient theme synthesised with Web Audio (no files, no copyright); `#mus` switches music, `#snd` (fx.js) switches
  sound effects. The two choices are stored separately (`mm-music`, `mm-sound`). Game sounds follow the sound switch.
- **Nickname, 15-day map, records** (`site/dune-host.js`): the first start asks for a nickname; every won mini-game finishes one day of the 15-day base map (a star if it was
  the planned crisis of that day, see `TARGETS`); day 15 shows a finale and writes the result to the full-mission board. Boards (top 5 missions, top 3 per mini-game, with empty
  "free place" rows) are stored in `localStorage` (`mm-camp`, `mm-rec`). Rooms report results with `DuneBridge.mini(...)`.
- Pages of the game carry their own Content-Security-Policy (inline handlers allowed, no network at all).
- Test: `python tests/dune_test.py http://localhost:8133/` (serve `dist/`); it also accepts a `file://` path to the one-file build.

## One-file version

`python tools/build_single.py` writes `dist-single/index.html`: the whole site and the game in one file (about 5 MB, photos re-encoded to 800 px).
It opens by double click and works offline; it has no installable app / service worker.

## v6 — what changed
- Home: working **Play** button, then **About the project**; plain readable text, soft gradient shadows, one themed sky and ground animation on every tab.
- Default language is English (EN / RU / TJ).
- New isometric base: wide walls with different materials, corridors between sections, no cabinets on walls, textured craters, rocks and mountains, moving sky, detailed rover, a complete airlock; the bump on top of the Mars surface is gone.
- Mini-game start cards: icons, aligned text; the crisis is drawn at random, no "1A/1B" numbering.
- Second crisis of every room has its own mini-games (9–16): slot generator, guess the cap, sorter, higher/lower, sample pairs, laser cooling, airlock code, plate wheel.
- Greenhouse harvest uses drawn cabbage and radish instead of emoji.
- Animations pause in a background tab.
Tests: `python3 tests/dune_test.py <url>`; build: `python3 tools/build.py && python3 tools/build_single.py`.

## v7 — campaign mechanics (15 sols)
Flow: mini-film slot (skippable) → name → **day map** → (special days: film, then the sol event) → pick **2 of 4 sectors** → one random crisis + one 10-second mini-game per chosen sector → end-of-sol crew mood → next day.
- Lives: 3 (shown on the map only). A sol that ends under 50% crew happiness costs one life and must be replayed (resources return to the start of that sol). No lives left → start again from day 1.
- Resources: life, energy, shield (on the base). Crew happiness = 0.6 × average + 0.4 × weakest. ≥70% happy, 50–69% neutral, <50% sad.
- Special days 1, 3, 6, 9, 12, 15 (floating gift). Events: 3 dust storm, 6 solar flare + radiation, 9 lost contact, 12 extreme cold; day 15 is the finale. Skipping a day-film is remembered (`camp.skipped`) for the reward to be added later.
- 3 NASA science tasks: each is completed after the laboratory has been used twice.
- "Message from Earth" hints (low resource + arrow) only before day 9; "Fact" chips stay all game; first-sol tips appear on day 1 only.
- Film slots: `site/dune/day.js` → `FILMS` (key `intro`, `d3`, `d6`, `d9`, `d12`, `d15`); put a video path into `src` to replace the placeholder. Characters: Mokhinur and Khurshed.
- Balance numbers live in `dune-bridge.js` (`ECO`, `EVENTS`, `UPKEEP`); v8 hard mode: a win is worth about +7 in total, daily upkeep is −2/−3/−2, events are 10% heavier, a loss costs half of the price and the main resource −4 (simulation: a skilled player wins ~70% of games without a restart; random play almost never finishes).
Tests: `python3 tests/camp_test.py <url>`, `python3 tests/dune_test.py <url>`.

## v9 — Knowledge Base, Awards, rover ride, harder economy
- **База Знаний** (ex-QR tab): all 53 cards are free to read, each with its own number and title.
- **Награды** (new tab): sticker album. Locked slots show the silhouette of a themed emoji. Cards are earned by films (21), mini-games 1–16 (16), rover samples (5, by cumulative rover distance 250 / 600 / 1000 / 1500 / 2100 m), the mission path (6) and the five science discoveries (5). New cards 201–205 have no photos yet.
- **Поездка на ровере**: hover (or tap) the rover on the base map. Costs 8 energy, once per sol, counts as a science visit like the lab, and gives a shield bonus by rating (A 6 / B 4 / C 2 / D 0).
- **Five science discoveries**: every 2 visits (lab + rover) unlock the next one.
- Mini-games 9–16 replaced by new puzzles (pipes, garden, heartbeat, odd vial, reactor, ice finder, hatch, pressure).
- Harder economy (v8) kept; the base screen has no slab borders.
- Tests: `tests/rover_album_test.py <url>`.
