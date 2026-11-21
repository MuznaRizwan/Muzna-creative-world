# Architecture

Muzna's Creative World is a Next.js App Router application in **JavaScript**. A vanilla
**Three.js** engine renders an explorable 3D world; React renders everything else
(portfolio panels, navigation, HUD, chatbot, contact form) as HTML above the canvas.
The original planning document is `architecture.pdf`; where it differs (TypeScript,
React Three Fiber, Rapier), this file and the approved later decisions take precedence.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `src/`), React 19, JavaScript (.js/.jsx) |
| Styling / UI motion | Tailwind CSS 4, Framer Motion |
| 3D | Vanilla Three.js (`GLTFLoader`, `DRACOLoader`, `AnimationMixer` from `three/addons`) |
| Physics | Custom lightweight physics: ground height checks, circle-vs-box collisions, trigger volumes |
| Data and AI | Supabase PostgreSQL with pgvector, an embeddings model and an LLM |
| Email | Resend |
| Hosting | Vercel |

Not used: TypeScript, React Three Fiber, Drei, Rapier.

## Two layers

```text
Browser window
├─ WebGL canvas  (src/lib/three, mounted by components/world/WorldCanvas.jsx)
│    world, zones, cat, follow camera, custom physics, triggers
└─ HTML overlay  (src/components)
     navbar, location label, interaction prompt, minimap, panels, chatbot, contact
```

The two layers talk through a small store in `src/lib/state/`:

- **Engine → UI:** loading progress, ready, current zone, nearby interactable.
- **UI → engine:** teleport to a zone, enable/disable input (e.g. while a panel is open),
  joystick vector, interact.
- Per-frame data (cat position) is read directly from the engine, for example by the
  minimap's own animation frame, never through React state.

## Folder structure

```text
src/
├─ app/            layout.jsx, page.jsx, globals.css, fonts.js, loading/error/global-error/not-found.jsx
│  └─ api/         chat/, contact/, ingest/ route handlers
├─ components/     React only (see src/components/README.md)
│  ├─ ui/  layout/  chatbot/  world/ (WorldCanvas, status, dev panel, fallback)   exist
│  └─ overlays/  navigation/  portfolio/  contact/                                planned
├─ lib/
│  ├─ three/       vanilla Three.js engine, no React (Phase 4)
│  │  ├─ Engine.js        renderer, scene, loop, resize, visibility pause, dispose
│  │  ├─ core/            Renderer, Time (delta clamp), Viewport (resize, pixel ratio), webgl check
│  │  ├─ camera/          DevCamera (temporary orbit + fly-to); follow camera later
│  │  ├─ loaders/         AssetLoader (LoadingManager, GLTF on demand)
│  │  ├─ utils/           ResourceTracker, static batching, canvas textures, fonts, seeded random
│  │  ├─ world/           World assembly, kit (shared materials/geometries), instancing, textures,
│  │  │                   terrain, debug overlay
│  │  │  ├─ environment/  ground, water, sky, lighting, paths, boundary wall, vegetation
│  │  │  ├─ locations/    one module per location + shared helpers
│  │  │  └─ props/        signage, furniture
│  │  ├─ avatar/          planned: cat (GLB or procedural placeholder), animation state machine
│  │  └─ interactions/    planned: zone triggers, interactables
│  ├─ physics/     planned: colliders, ground height, character controller (plain math)
│  ├─ state/       planned: engine ↔ React store
│  ├─ ai/          planned: embeddings and RAG pipeline
│  ├─ supabase/    server.js (service-role client)
│  └─ email/       resend.js
├─ hooks/          planned: useGameStore, useReducedMotion, useWebGLSupport
├─ data/           portfolioData.js, portfolio-knowledge.js (single source of content)
├─ constants/      site.js, assets.js
├─ types/          JSDoc @typedef modules (no runtime code)
└─ utils/          cn.js
public/            models/, textures/, videos/, images/, audio/  (draco/ added with the cat model)
art-source/        blender/, after-effects/  (git-ignored working files)
archive/           superseded R3F/TypeScript prototype; not built, linted or imported
supabase/          migrations/ (pgvector schema)
```

## Engine lifecycle rules

- `WorldCanvas.jsx` is a client component that imports the engine with
  `next/dynamic(..., { ssr: false })`. In Next.js 16 that call must itself sit in a client
  component.
- The engine is created in `useEffect` and fully disposed in its cleanup: stop the loop,
  remove listeners and the resize observer, dispose geometries, materials, textures and
  the renderer. React Strict Mode mounts twice in development, so create/dispose must be
  safe to repeat.
- Check WebGL support before creating the renderer and show a fallback without it.
- Cap the pixel ratio at 2, pause rendering when the tab is hidden, and clamp frame delta.

## Physics approach

A kinematic character controller with a fixed 60 Hz step:

- Ground height comes from a list of axis-aligned platforms, not mesh raycasts. Steps of
  up to 0.35 units are climbed automatically.
- Gravity and jump are integrated by hand (gravity 20, jump velocity 6).
- The cat is a circle (radius 0.4) resolved against axis-aligned boxes one axis at a time,
  which gives sliding along walls.
- Zone and interaction triggers are point-in-volume tests with enter/exit events.

## Assets

- Cat: `public/models/muzna-cat.glb` (Blender export; requirements in
  `public/models/README.md`). Until it exists, the engine draws a procedural placeholder.
- Promo video: `public/videos/portfolio-intro.mp4` (After Effects export).
- Draco decoder files are copied from `three/examples/jsm/libs/draco` into
  `public/draco/` when the first compressed model is added.
