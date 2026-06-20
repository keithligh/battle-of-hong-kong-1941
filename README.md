<div align="center">

# 香港保衛戰 1941 · The Battle of Hong Kong

### A self-playing 3D documentary of the 18-day battle, rendered on the **real terrain of Hong Kong** and built with an AI coding agent from a **single prompt**.

[![live demo](https://img.shields.io/badge/live_demo-online-2ea44f?style=for-the-badge)](https://keithligh.github.io/battle-of-hong-kong-1941/)
&nbsp;
[![built with Claude Code](https://img.shields.io/badge/built_with-Claude_Code-d97757?style=for-the-badge)](PROMPT.md)
&nbsp;
[![Star this repo](https://img.shields.io/badge/%E2%98%85_Star_this_repo-FFD93D?style=for-the-badge&logo=github&logoColor=181717)](https://github.com/keithligh/battle-of-hong-kong-1941)

[![code MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![content CC BY 4.0](https://img.shields.io/badge/content-CC_BY_4.0-blue)](https://creativecommons.org/licenses/by/4.0/)
[![Three.js r128](https://img.shields.io/badge/Three.js-r128-000000)](https://threejs.org/)
[![no build, runs offline](https://img.shields.io/badge/build-none-success)](#run-it-locally)

[![The live engine: a directed camera over real Hong Kong terrain during the fight for Wong Nai Chung Gap, with bilingual captions, troop-strength readouts, the legend and the day/night timeline transport](docs/demo.gif)](https://keithligh.github.io/battle-of-hong-kong-1941/)

**▶ [Try the live demo](https://keithligh.github.io/battle-of-hong-kong-1941/)** &nbsp;·&nbsp; **📜 [Read the prompt that built it](PROMPT.md)**

</div>

---

**The Battle of Hong Kong** ran eighteen days, 8–25 December 1941, ending with the colony's surrender on Christmas Day.
This replays it in 3D on the **actual terrain of Hong Kong**: real elevation, real satellite imagery, projected to
scale. A camera **directs itself** through the campaign, across historically-sourced troop movements, the **real 1941
flags**, bilingual narration, weather, and a day/night cycle. **Every frame is the live engine. Nothing is mocked up.**
No build step, no backend, no API keys: one folder of static files that runs in any browser.

The part worth sharing: **it was built with an AI coding agent ([Claude Code](https://claude.com/claude-code)) from a
single written brief**, then directed and fact-checked by hand. The brief ships right here in the repo:
**[PROMPT.md](PROMPT.md)**. Read it, then watch what it produced.

## Highlights

- 🗺️ **Real Hong Kong, to scale.** Actual SRTM elevation and Sentinel-2 satellite imagery, projected by real lng/lat. Not a stylised map.
- 🎬 **It directs itself.** A cinematic "Director" plays the eighteen days as a sequence of shots; grab the camera any time to free-look, and it resumes.
- ⚔️ **Historically sourced.** Dated troop movements, front lines, commanders, major events, and the real December 1941 flags (the green-leaf Canadian ensign, the 1876 Hong Kong badge, the period Rising Sun, with no anachronisms).
- 🌧️ **Atmosphere.** Muzzle flashes, rain, a day/night cycle, and a period soundtrack.
- 🌏 **Bilingual.** 中文 and English narration and labels throughout.
- ⚡ **Zero infrastructure.** No build, no backend, no API keys; runs offline from static files.
- 🤖 **Made with AI, in the open.** Built with Claude Code, and the originating prompt is right here in the repo.

## Gallery

<table>
  <tr>
    <td width="50%"><img src="docs/invasion.jpg" alt="Japanese 38th Division crossing into the New Territories, 8 December 1941"><br><sub><b>8 Dec · 日軍入侵新界.</b> Sano's 38th Division crosses the Shenzhen River into the New Territories.</sub></td>
    <td width="50%"><img src="docs/wong-nai-chung-gap.jpg" alt="The battle for Wong Nai Chung Gap on Hong Kong Island"><br><sub><b>黃泥涌峽爭奪戰.</b> The fight for Wong Nai Chung Gap, the hinge of the island battle.</sub></td>
  </tr>
  <tr>
    <td><img src="docs/repulse-bay.jpg" alt="Fighting at Repulse Bay, 21 December 1941"><br><sub><b>21 Dec · 淺水灣激戰.</b> The Japanese press south past Repulse Bay toward Stanley.</sub></td>
    <td><img src="docs/fall-of-hong-kong.jpg" alt="The fall of Hong Kong on Christmas Day 1941"><br><sub><b>25 Dec · 黑色聖誕.</b> "Black Christmas": the surrender, ending eighteen days of fighting.</sub></td>
  </tr>
</table>

> Every still above is a real frame from the live engine over real elevation and satellite imagery. Geography is
> **present-day**; the 1941 coastline was narrower, so see *Historical accuracy* below.

> _If this made you think "wow, AI can build that?", a ⭐ helps other people find it._

## Run it locally

Map tiles must be loaded over HTTP (same-origin). Opening `index.html` via `file://` will **not** work.

1. **Fetch the terrain and imagery tiles (first time only).** Requires **PowerShell 7+ (`pwsh`)**, cross-platform
   (Windows / macOS / Linux; install from <https://aka.ms/powershell>):
   ```
   pwsh tools/fetch_tiles.ps1
   ```
   This downloads ~242 tiles (elevation and satellite imagery) for the Hong Kong bounding box from their source
   providers into `lib/tiles/`. No account or API key is required.

2. **Serve and open:**
   ```
   node tools/serve.js
   ```
   then open <http://localhost:5050>. (Windows: double-click **`start.bat`**; macOS/Linux: `sh start.sh`.)

## How it works

- **Terrain:** AWS "Terrarium" elevation tiles (SRTM/USGS, public domain) decoded to a real height-mesh,
  Web-Mercator, to scale (with a fixed vertical exaggeration for legibility).
- **Surface:** EOX *Sentinel-2 cloudless 2016* satellite imagery draped over the terrain.
- **Direction:** a state-machine "Director" plays a fixed storyboard of shots; free-look pauses it.
- Everything is data-driven from `data.js` (forces, dated movement tracks, front lines, weather, storyboard,
  narration). `app.js` and its ES modules are the engine; `index.html` is the page.

## Licensing

- **Code** (the `.js` source, `index.html`, `tools/`): **MIT**, see [`LICENSE`](LICENSE).
- **Narration, scenario data and text content:** **CC BY 4.0**,
  <https://creativecommons.org/licenses/by/4.0/>.
- **Bundled and fetched third-party software and data** (Three.js, Sentinel-2 imagery, SRTM/USGS elevation, the
  background music) retain their own licenses; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Credits and data sources

- Satellite imagery: **Sentinel-2 cloudless 2016 © EOX IT Services GmbH** (s2maps.eu); contains modified
  Copernicus Sentinel data.
- Elevation: **SRTM, courtesy U.S. Geological Survey** via AWS Terrain Tiles.
- 3D engine: **Three.js** (MIT).
- Background music: *"Victoria Harbour 1941"*, composed by Keith Li with **Suno**.
- Historical sources: Wikipedia "Battle of Hong Kong"; Tony Banham, *Not the Slightest Chance*; CWGC; Juno Beach
  Centre; Valour Canada; ww2db; Hong Kong Observatory.

## Historical accuracy (please read)

This is an **illustrative reconstruction**, not an authoritative tactical record:

- **Geography is present-day.** The satellite imagery and elevation are modern; Victoria Harbour's shoreline
  (Central/Wan Chai/Kowloon reclamation, Kai Tak, Chek Lap Kok, bridges) is post-war and did **not** exist in 1941.
  The 1941 coastline was narrower, so coastlines, landing beaches, and shoreline unit positions are shown only
  approximately.
- **Troop positions are narrative-schematic.** They are anchored to real place-name coordinates, but are not an
  hour-by-hour precise tactical map.
- **Unit markers fly the real national / service flag each force used in December 1941:** the IJA Army War Flag, the
  IJN Naval Ensign, the Union Flag, the Canadian Red Ensign (green-leaf, 1922–57), the Star of India Red Ensign, the
  Hong Kong colonial Blue Ensign (1876 badge), and the White Ensign. They are drawn from period sources and simplified
  for marker legibility (**not** the modern flags: no maple-leaf flag, no Indian tricolour, no Bauhinia). The Rising
  Sun is shown for historical accuracy; its status as a contested symbol of wartime militarism is acknowledged.

## Author

Built by **Keith Li**. Find me on [LinkedIn](https://www.linkedin.com/in/keithlihk/).
