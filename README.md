# Sijin Agasthi — 3D Open-World Portfolio

An explorable 3D open-world portfolio for **Sijin Agasthi (Software Developer & AI Engineer)**. The visitor controls a stylized low-poly character riding an iconic yellow scooter through a golden-hour city and daytime biome. Each portfolio section is a physical landmark in the world, with floating 3D text overlays, an interactive arched bridge, illuminated project billboards, career timeline signposts, dimensional ring portals, and a connected spheres contact hub.

Reference feel: Bruno-Simon-style immersive portfolio, set at golden-hour in a toy-like city.

---

## 🌟 Features & World Stops

### 🗺️ The 10 Stops along the Looping Route
1. **Loader Screen**: Plain light-grey screen with a low-poly scooter driving across a ghosted skyline, animated percent counter (000→100%), and a "START EXPLORING" button that dissolves with a white-out into the world.
2. **Spawn Plaza (Hero)**: Waterfront promenade with obelisk landmark, floating greeting (*"Sijin Agasthi, Software Developer & AI Engineer — Welcome to my world"*).
3. **Landmark Arch (About)**: Monumental terracotta archway with cafe tables, striped umbrellas, and frosted bio panel detailing B.Tech degree, Kannur location, and engineering focus.
4. **The Skill Zone Gate**: Futuristic gateway between two buildings with illuminated floating slats representing core tools (Python, C#, .NET, ASP.NET, Java, C, C++, Power BI, Matplotlib, R, Raspberry Pi, Generative AI).
5. **Winding Bridge Road (Projects)**: Arched stone bridge spanning the lavender-blue canal with two large illuminated roadside billboards:
   - **VisionAid**: Smart glasses on Raspberry Pi + camera with generative AI voice assistance.
   - **Driver Drowsiness Detection**: LSTM-KNN & EAR analysis with 81.5% accuracy.
6. **Journey Road (Timeline)**: Milestone signposts along the boulevard covering 2023, 2024, 2025, and 2026.
7. **Glowing Ring Portal (Transition)**: Large rotating golden ring that dissolves the atmosphere into the daytime sky biome.
8. **Contact Hub (Day Biome)**: Connected geometric spheres with floating `@` beacon and GitHub ring. Clickable links to email and GitHub profile.
9. **Giant 3D Letters Street**: Oversized pink extruded letters spelling **"HELLO"** flanked by narrow pastel European-style townhouses.
10. **Final Room & Red Door Loop**: Atmospheric gallery room with framed pictures and a glowing red portal door. Walking through fades to white and loops seamlessly back to the Spawn Plaza.

---

## 🎮 Controls

| Platform | Inputs | Action |
| :--- | :--- | :--- |
| **Desktop** | **W / A / S / D** or **Arrow Keys** | Drive & steer the scooter |
| **Desktop** | **Scroll Wheel** | Progress along the Catmull-Rom path (Scroll Mode) |
| **Desktop** | **Shift** | Boost acceleration |
| **Desktop** | **Space** | Scooter horn beep (Web Audio) |
| **Desktop** | **Mouse Drag** | Orbit chase camera around character |
| **Desktop** | **Esc** | Open / close navigation menu |
| **Mobile** | **Virtual Joystick** | Touch drag on bottom-left to drive & steer |
| **Mobile** | **Auto-Ride Button** | Toggle automatic cruising through all 10 stops |

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite dev server
npm run dev

# 3. Build for production (GitHub Pages)
npm run build
```
The site runs on `http://localhost:5173/portfolio/`.

To inspect 3D parameters live, open with `?debug`:
`http://localhost:5173/portfolio/?debug`

---

## 🛠 Customization Guide

### 1. How to Edit Portfolio Content
All text, bios, projects, skills, timeline events, and links are defined in:
[`src/content.js`](./src/content.js)

### 2. How to Reorder or Customize World Stops
Each landmark's 3D coordinates, camera framing, trigger radius, and overlay cards are configured in:
[`src/stops.js`](./src/stops.js)

### 3. How to Swap in a Custom Avatar GLB
Open [`src/player.js`](./src/player.js). The `Player` class provides a dedicated method:
```javascript
player.loadCustomAvatar('/models/your-avatar.glb');
```
Place your `.glb` file inside the `public/models/` folder.

### 4. How to Replace Framed Photos
Place your personal photos (`IMG_0005.jpeg` and `IMG_3529.jpeg`) in `public/images/`. They will be displayed on the gallery frames and about panels.

### 5. Audio Customization
The portfolio uses a zero-dependency Web Audio API synthesizer for the ambient sunset chime drone, scooter engine frequency modulation, and horn beep. To use pre-recorded MP3/OGG loops instead, simply hook your audio files into [`src/audio.js`](./src/audio.js).

---

## 📋 List of Remaining Placeholders

- **LinkedIn URL**: Set to `TODO_LINKEDIN_URL` in `src/content.js`. Replace with your actual LinkedIn profile link when available.
- **Custom Avatar GLB**: Currently uses an optimized procedural low-poly person with short dark curly hair and jacket on a yellow scooter. You can swap in a custom GLTF/GLB avatar model via `player.loadCustomAvatar()`.
- **Personal Photos**: Place `IMG_0005.jpeg` and `IMG_3529.jpeg` in `public/images/` to populate the gallery picture frames.
- **Audio Files**: Currently uses procedural Web Audio API chimes and engine hum; external CC0 audio files can be attached in `src/audio.js` if desired.

---

## 🌐 Live GitHub Pages Deployment

- **Repository**: [https://github.com/sijinagsthi111-netizen/portfolio.git](https://github.com/sijinagsthi111-netizen/portfolio.git)
- **Live Deployment URL**: [https://sijinagsthi111-netizen.github.io/portfolio/](https://sijinagsthi111-netizen.github.io/portfolio/)
- **Workflow**: Automated build and deployment to GitHub Pages via [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) on push to `main`.
