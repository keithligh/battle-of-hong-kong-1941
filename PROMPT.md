# The Prompt

This project — a self-playing 3D TV-documentary of the **Battle of Hong Kong (8–25 December 1941)** — was built
from a single brief. Hand the prompt below to an AI coding agent (e.g. Claude Code) to recreate it from scratch.

```
Introduce the "Battle of Hong Kong" (8–25 Dec 1941, 18 days) as a TV-documentary-style 3D production with cinematic
camera moves and effects. It should feel like a game or history program, with a freely movable camera.

Terrain — true scale: build a real height-mesh from real elevation data (DEM, e.g. AWS Terrarium/SRTM), drape
openly-licensed satellite imagery over it (e.g. EOX Sentinel-2 cloudless, CC BY — do not use sources that forbid
offline redistribution), projected to scale by real lng/lat (Web Mercator). Store terrain + imagery tiles as local
files so it runs offline. Label terrain and place names.

Tech: pure front-end, a single index.html — no build tools, no backend, no API keys, works offline. Use Three.js r128
(loaded as a classic <script>) with the engine written as ES modules; keep all scenario data in data.js.

Forces: Japanese red, British/Commonwealth blue. Along a timeline, show each unit's formation, movement direction
(arrows), commander name, combat strength, major events, and the shifting front line.

Flags: on each unit's flag-pole draw the real national/service flag it served under in December 1941: IJA = Rising Sun
war flag (16 rays, disc centred), IJN = naval ensign (16 rays, disc offset toward the hoist); Britain = 1801 Union
Flag; British India = Star of India Red Ensign; Canada = 1922–57 Canadian Red Ensign (maple leaves must be GREEN);
Hong Kong = 1876 colonial Blue Ensign; Royal Navy = White Ensign. Keep them historically accurate — no anachronisms
(no 1965 maple-leaf flag, no 1947 Indian tricolour, no 1997 Bauhinia, no 8-ray sun). Note the Rising Sun's contested
status neutrally.

Effects: guns/cannon (muzzle flashes, explosions), weather (rain), and a day-night lighting cycle over the timeline.

Playback: a self-running "Director" plays a fixed storyboard of shots; free-look pauses it and resumes on release.

UI: bilingual (Traditional Chinese + English); timeline, legend, place labels.

Audio: optional period soundtrack, loaded muted (autoplay), unmuted only by a user button — never play sound without
an explicit action.

History: facts must be verified and cross-checked against sources (no fabrication); list the sources.
```
