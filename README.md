# The Battle of Hong Kong, 1941 — an interactive 3D documentary

A self-playing, cinematic 3D retelling of the **Battle of Hong Kong (8–25 December 1941)**,
rendered on **real-to-scale terrain** of Hong Kong with a directed "TV-documentary" camera,
bilingual (中／EN) narration, troop movements, front lines, weather, and a day/night cycle.

Built with **Three.js (r128)** as a fully self-contained static site — **no build step, no
backend, no API keys.** It runs from a single folder served over local HTTP.

**▶ Live demo:** <https://keithligh.github.io/battle-of-hong-kong-1941/>

> **Why this exists** — an open demonstration of how an AI coding agent (Claude Code) can create this kind of 3D
> historical animation from a single written brief, then directed and refined by hand: history sourced and verified,
> visuals tuned, bugs fixed. The brief it started from is in **[PROMPT.md](PROMPT.md)**.

## Gallery

The eighteen-day campaign plays itself as a directed sequence of shots over real Hong Kong terrain — troop
movements, front lines, attack arrows, weather, and a day/night cycle, narrated bilingually (中／EN). Every
frame below is the live engine rendering real elevation + satellite imagery; nothing is mocked up.

![The live interface during the battle for Wong Nai Chung Gap, 19 December 1941 — directed camera over real terrain, bilingual lower-third captions, troop-strength readouts, the legend, and the day/night timeline transport](docs/demo.gif)

<table>
  <tr>
    <td width="50%"><img src="docs/invasion.jpg" alt="Japanese 38th Division crossing into the New Territories, 8 December 1941"><br><sub><b>8 Dec · 日軍入侵新界</b> — Sano's 38th Division crosses the Shenzhen River into the New Territories.</sub></td>
    <td width="50%"><img src="docs/wong-nai-chung-gap.jpg" alt="The battle for Wong Nai Chung Gap on Hong Kong Island"><br><sub><b>黃泥涌峽爭奪戰</b> — the fight for Wong Nai Chung Gap, the hinge of the island battle.</sub></td>
  </tr>
  <tr>
    <td><img src="docs/repulse-bay.jpg" alt="Fighting at Repulse Bay, 21 December 1941"><br><sub><b>21 Dec · 淺水灣激戰</b> — the Japanese press south past Repulse Bay toward Stanley.</sub></td>
    <td><img src="docs/fall-of-hong-kong.jpg" alt="The fall of Hong Kong on Christmas Day 1941"><br><sub><b>25 Dec · 黑色聖誕</b> — "Black Christmas": the surrender, ending eighteen days of fighting.</sub></td>
  </tr>
</table>

> Geography is **present-day** (satellite + elevation); the 1941 coastline was narrower — see *Historical accuracy* below.

## Run it locally

Map tiles must be loaded over HTTP (same-origin) — opening `index.html` via `file://` will
**not** work.

1. **Fetch the terrain + imagery tiles (first time only).** Requires **PowerShell 7+ (`pwsh`)** —
   cross-platform (Windows / macOS / Linux; install from <https://aka.ms/powershell>):
   ```
   pwsh tools/fetch_tiles.ps1
   ```
   This downloads ~242 tiles (elevation + satellite imagery) for the Hong Kong bounding box from
   their source providers into `lib/tiles/`. No account or API key is required.

2. **Serve and open:**
   ```
   node tools/serve.js
   ```
   then open <http://localhost:5050>. (Windows: double-click **`start.bat`**; macOS/Linux: `sh start.sh`.)

## How it works

- **Terrain:** AWS "Terrarium" elevation tiles (SRTM/USGS, public domain) decoded to a real
  height-mesh, Web-Mercator, to scale (with a fixed vertical exaggeration for legibility).
- **Surface:** EOX *Sentinel-2 cloudless 2016* satellite imagery draped over the terrain.
- **Direction:** a state-machine "Director" plays a fixed storyboard of shots; free-look pauses it.
- Everything is data-driven from `data.js` (forces, dated movement tracks, front lines, weather,
  storyboard, narration). `app.js` and its ES modules are the engine; `index.html` is the page.

## Licensing

- **Code** (the `.js` source, `index.html`, `tools/`): **MIT** — see [`LICENSE`](LICENSE).
- **Narration, scenario data & text content:** **CC BY 4.0** —
  <https://creativecommons.org/licenses/by/4.0/>.
- **Bundled / fetched third-party software & data** (Three.js, Sentinel-2 imagery, SRTM/USGS
  elevation, the background music) retain their own licenses — see
  [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Credits & data sources

- Satellite imagery: **Sentinel-2 cloudless 2016 © EOX IT Services GmbH** (s2maps.eu) — contains
  modified Copernicus Sentinel data.
- Elevation: **SRTM, courtesy U.S. Geological Survey** via AWS Terrain Tiles.
- 3D engine: **Three.js** (MIT).
- Background music: *"Victoria Harbour 1941"* — original AI composition by the author via **Suno**.
- Historical sources: Wikipedia "Battle of Hong Kong"; Tony Banham, *Not the Slightest Chance*;
  CWGC; Juno Beach Centre; Valour Canada; ww2db; Hong Kong Observatory.

## Historical accuracy — please read

This is an **illustrative reconstruction**, not an authoritative tactical record:

- **Geography is present-day.** The satellite imagery and elevation are modern; Victoria Harbour's
  shoreline (Central/Wan Chai/Kowloon reclamation, Kai Tak, Chek Lap Kok, bridges) is post-war and
  did **not** exist in 1941. The 1941 coastline was narrower, so coastlines, landing beaches, and
  shoreline unit positions are shown only approximately.
- **Troop positions are narrative-schematic** — anchored to real place-name coordinates, but not an
  hour-by-hour precise tactical map.
- **Unit markers fly the real national / service flag each force used in December 1941** — the IJA Army War Flag,
  the IJN Naval Ensign, the Union Flag, the Canadian Red Ensign (green-leaf, 1922–57), the Star of India Red Ensign,
  the Hong Kong colonial Blue Ensign (1876 badge), and the White Ensign — drawn from period sources and simplified for
  marker legibility (**not** the modern flags: no maple-leaf flag, no Indian tricolour, no Bauhinia). The Rising Sun is
  shown for historical accuracy; its status as a contested symbol of wartime militarism is acknowledged.

## Author

Built with ❤️ by **Keith Li** — [LinkedIn](https://www.linkedin.com/in/keithlihk/).
