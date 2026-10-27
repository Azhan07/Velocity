# VELOCITY — The Future of Supercars

> Feel the Machine. Control the Experience.

A cinematic, interactive supercar website built with **React (JavaScript)**, **Three.js / React Three Fiber**, **GSAP ScrollTrigger**, **Framer Motion** and **Tailwind CSS** — bundled with **Webpack** (no Vite, no TypeScript).

---

## 1. Quick start

You need **Node.js 18 or newer** (check with `node -v`).

```bash
# 1. install dependencies
npm install

# 2. (optional) enable real AI — the site works fully without this
cp .env.example .env        # Windows: copy .env.example .env
# then open .env and paste your ANTHROPIC_API_KEY

# 3. run the website + API server together
npm run dev
```

Open **http://localhost:3000**.

| Command | What it does |
| --- | --- |
| `npm run dev` | Website (port 3000, hot reload) **and** API server (port 5050) together |
| `npm start` | Website only (AI falls back to the offline engine) |
| `npm run server` | API server only |
| `npm run build` | Production build into `/build` |
| `npm run serve` | Serves the production build + API on http://localhost:5050 |

---

## 2. What's inside

| Route | Page |
| --- | --- |
| `/` | Cinematic home: ignition preloader → car rolls in with headlights flickering on → scroll-driven camera orbit through 4 chapters → manifesto → horizontal pinned gallery |
| `/explore` | Collection with search, brand/category/power/price filters, sorting, grid & gallery layouts, quick view, favourites |
| `/cars/:id` | Details: 3D viewer, animated spec counters, launch simulator, power/torque chart, similar cars |
| `/configurator/:id` | Real-time 3D configurator: 5 paints, 3 wheels, 3 interiors, 5 camera views incl. interior, 3 lighting environments, live price, save/edit builds |
| `/performance` | Performance lab: launch simulator, power curves, leaderboard, head-to-head comparison (bars, radar, speed-over-time) |
| `/garage` | Saved builds and favourites (LocalStorage) with edit/remove/clear and empty states |
| `/advisor` | AI car advisor (5 questions → 3 matches) and the AI car expert chat |
| `/showroom` | Virtual showroom: orbit camera, environment switching, turntable car swaps |

### Signature animations
- **Ignition preloader** — a tachometer needle tracks the *real* model download progress, hits the redline, and the screen splits open.
- **Car entrance** — the car rolls in from darkness with wheels spinning, light streaks racing past on the floor, headlights flickering on.
- **Scroll-driven orbit** — one pinned 3D canvas; GSAP ScrollTrigger moves the camera around the car while chapter text, counters and lighting colours change in sync.
- **Reflection sweep** — a moving light slides across the clear-coat every few seconds.
- **Paint morph + floor ripple** — new paint blends smoothly over the body while a ring of that colour ripples across the floor.
- **Smart camera** — the configurator flies to the part you change (front for paint, profile for wheels, cockpit for interior).
- **Pit-lane page wipe** — a black panel with a glowing red edge sweeps between pages.
- **Turntable swap** — in the showroom the next car rises through the floor with a 360° spin.
- **Magnetic buttons, reticle cursor, 3D-tilt cards with glare, word-by-word manifesto, horizontal pinned gallery.**
- **Synthesised engine sound** (off by default) that revs with your scroll speed and during launch simulations.

Everything respects **prefers-reduced-motion** (hard camera cuts instead of continuous motion, no decorative loops).

---

## 3. Project structure

```
velocity/
├── public/
│   ├── models/ferrari.glb, ferrari_ao.png   ← 3D model + baked contact shadow
│   ├── draco/                                ← Draco decoder (model is compressed)
│   ├── images/cars/*.webp                    ← studio renders made from the 3D model
│   └── index.html
├── server/index.mjs                          ← Express API (keeps the AI key secret)
├── src/
│   ├── components/
│   │   ├── layout/   Navbar, Footer, PageTransition, Preloader
│   │   ├── home/     HeroSection, ScrollStory, FeaturedCars
│   │   ├── three/    CarModel, CarCanvas, HeroScene, ShowroomScene, ConfiguratorScene,
│   │   │             CameraController, StudioLights, Floor, CarFallback
│   │   ├── cars/     CarCard, CarGrid, CarFilters, QuickView, CarImage
│   │   ├── configurator/ ColorSelector, WheelSelector, InteriorSelector, BuildSummary, OptionGroup
│   │   ├── performance/  Speedometer, PowerChart, ComparisonChart, CompareTool
│   │   ├── ai/       AdvisorForm, ExpertChat, ExpertLauncher
│   │   └── ui/       Logo, Magnetic, CustomCursor, Counter, SectionHeading, DataNotice
│   ├── context/      GarageContext (favourites/builds/compare), SoundContext
│   ├── data/cars.js  ← all vehicles + configurator options (one place to edit)
│   ├── hooks/        useLocalStorage, useReducedMotion, useDevice
│   ├── pages/        Home, Explore, CarDetails, Configurator, Performance, Garage, Advisor, Showroom, NotFound
│   ├── utils/        pricing, curves, engineSound, localAdvisor, localExpert, aiClient, ready, format
│   ├── App.jsx, main.jsx, index.css
├── webpack.config.js, babel.config.js, tailwind.config.js, postcss.config.js
└── package.json
```

---

## 4. Key decisions (in plain English)

**Why Webpack instead of Create React App?** The brief says "no Vite". Create React App is deprecated and does not support React 19 well, so we use a small, readable `webpack.config.js` instead. It does the same job: compiles JSX with Babel, runs Tailwind, and serves the site with hot reload.

**How does paint change only the body?** The 3D model has separately named parts (`body`, `rim_fl`, `glass`, `leather` …). `CarModel.jsx` gives each group its own material, so the paint colour only touches the `body` mesh. If you swap in a model without these names, the configurator detects it and disables the option with an honest message instead of pretending.

**Why don't animations make React slow?** Anything that changes every frame (camera, wheel spin, needle, counters) is stored in a `useRef` and updated inside `useFrame` / `requestAnimationFrame`. React re-renders only when you click something.

**Why GSAP *and* Framer Motion?** GSAP handles scroll-driven sequences (ScrollTrigger); Framer Motion handles UI components (menus, modals, cards). They never animate the same element. All GSAP work is inside `gsap.context()` and is reverted when the page unmounts.

**How is the AI key protected?** The browser only calls `/api/advisor` and `/api/expert` on our own Express server. The server reads `ANTHROPIC_API_KEY` from `.env`. The key never appears in frontend code. The AI is given the car dataset and told to use only that data; the frontend also discards any car id that is not in the dataset.

**What if AI is unavailable?** `utils/localAdvisor.js` (scoring engine) and `utils/localExpert.js` (rule-based answers) take over automatically — the UI shows "Offline mode".

**Where is the engine sound from?** It is synthesised live with the Web Audio API (oscillators + distortion + filter) — no copyrighted recordings, no download, never autoplays.

---

## 5. Honest notes & limitations

- **All cars, specs and prices are fictional/illustrative** concept data (labelled throughout the UI). Power curves and launch timings are generated from the quoted figures and labelled "illustrative" / "simulation".
- **One reference 3D model is used for every car.** Each car shows its own paint, data and story, but the body shape is the same.
- **3D model credit:** "Ferrari 458 Italia" by **vicent091036** on Sketchfab (https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6), distributed with the three.js examples. It is listed under a Creative Commons Attribution licence — **check the licence on that page yourself before publishing**, keep the credit (it's in the footer), and note the model depicts a real, trademarked car. For a public or commercial launch, replace it with a model you have rights to:
  1. Put your `.glb` in `public/models/` and update `MODEL_URL` in `src/components/three/CarModel.jsx`.
  2. Name the parts in Blender: `body`, `rim_fl/fr/rl/rr`, `glass`, `leather`, `trim`, `lights`, `wheel_fl/fr/rl/rr` (or edit the name checks in `CarModel.jsx`).
  3. Re-render the studio images in `public/images/cars/` (or delete them — cards fall back to an SVG silhouette).
- **Fonts** load from Google Fonts (Unbounded, Inter Tight, JetBrains Mono); without internet the system font is used.
- **WebGL fallback:** without WebGL, or if the model fails to load, every 3D view shows a 2D silhouette instead.
- Tested with a production build in headless Chromium (software WebGL). Do a final check on real phones/tablets, as GPU performance varies.

---

## 6. Customising

- **Add a car:** add an object to `cars` in `src/data/cars.js` — it appears everywhere (collection, details, compare, advisor, expert).
- **Change options/prices:** edit `paints`, `wheels`, `interiors` in the same file.
- **Brand colours & fonts:** `tailwind.config.js`.
- **Hero camera path:** the `SHOTS` array in `src/components/three/HeroScene.jsx`.
# Velocity
