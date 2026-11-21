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
│  ├─ overlays/    InteractionPrompt (exists); location label, minimap            planned
│  └─ navigation/  portfolio/  contact/                                           planned
├─ lib/
│  ├─ three/       vanilla Three.js engine, no React (Phase 4)
│  │  ├─ Engine.js        renderer, scene, loop, resize, visibility pause, camera modes, dispose
│  │  ├─ core/            Renderer, Time (delta clamp), Viewport (resize, pixel ratio), webgl check
│  │  ├─ camera/          DevCamera (temporary orbit + fly-to), FollowCamera (third person)
│  │  ├─ loaders/         AssetLoader (LoadingManager, GLTF on demand)
│  │  ├─ input/           KeyboardInput (held keys + one-shot actions)
│  │  ├─ utils/           ResourceTracker, static batching, canvas textures, fonts, seeded random
│  │  ├─ world/           World assembly, kit (shared materials/geometries), instancing, textures,
│  │  │                   terrain, debug overlay
│  │  │  ├─ environment/  ground, water, sky, lighting, paths, boundary wall, vegetation
│  │  │  ├─ locations/    one module per location + shared helpers
│  │  │  └─ props/        signage, furniture
│  │  ├─ avatar/          CatModel (GLB prep), catClips (clip extraction), CatAnimator, CatPlayer
│  │  └─ interactions/    InteractionSystem (focus, E to interact, handlers per object/zone)
│  ├─ physics/     CollisionWorld (boxes, ground, boundary, walkways, raycast), CharacterController
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

A kinematic character controller (`src/lib/physics/`, plain maths) with a fixed 60 Hz
step; rendering interpolates between steps.

- Ground height is the walking surface (terrace + paving/path lift), raised by the top of
  any collider box the cat stands on, or a walkway deck (the pier). No mesh raycasts.
  Steps of up to 0.35 units are climbed automatically; higher ledges need a jump.
- Gravity and jump are integrated by hand (gravity 20, jump velocity 6, apex 0.9), with a
  short coyote time and jump buffer.
- The cat is a vertical cylinder (radius 0.4, height 1) pushed out of axis-aligned boxes
  (circle vs box), which gives sliding along walls. A uniform grid keeps queries local.
- The walkable boundary sits just inside the island wall; leaving it projects the cat
  back onto the edge, so it slides along the wall and cannot jump over it.
- Movement is tank-style: W/S along the facing direction, A/D turn with a little inertia.
- Interaction targets are points within 2 units, preferring ones the cat faces.

## Assets

- Cat: `public/models/Cat Muzna/Cat Muzna/`: `Cat.glb` plus one GLB per animation, all
  exported from the same Rigify rig (details in `public/models/README.md`). The clips are
  taken from the animation files and bound to the base model by bone name; the running
  clip's root motion is removed. If the cat fails to load, the world stays on the dev
  camera.
- Promo video: `public/videos/portfolio-intro.mp4` (After Effects export).
- Draco decoder files are copied from `three/examples/jsm/libs/draco` into
  `public/draco/` when the first compressed model is added.
