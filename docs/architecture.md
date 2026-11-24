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

The two layers talk through a small store in `src/lib/state/` (`worldState.js`), one per
mounted world, shared through React context (`components/world/WorldContext.js`) and read
with `hooks/useStore.js`:

- **Engine → UI:** camera mode, cat ready, the interactable in reach (`focus`). Written
  only when they change.
- **UI → engine:** the open portfolio panel. While one is open the engine locks the cat
  (movement, jump, interact, reset). The few direct calls are interact (the prompt's tap
  target) and travel to a location.
- Per-frame data (cat position) is read directly from the engine, for example by the
  minimap's own animation frame, never through React state.

## Interactions

- `src/data/interactables.js` defines every interactable object: id, name, zone, type,
  prompt ("Press E to …"), reach and action (e.g. open the `skills` panel). Location
  builders only place an id next to its prop with `ctx.interactable({ id, x, y, z })`.
  The World merges the two; a placed id with no definition is skipped with a warning.
- `src/data/portfolioSections.js` lists the eight sections (one per location).
- `InteractionSystem` (engine) picks the single nearest object in reach, preferring ones
  the cat faces, and dispatches actions by kind (`registerAction`). Detection knows
  nothing about the DOM.
- Pressing E: the cat turns to face the object, plays the interaction clip once with
  movement locked, and the action runs at the paw tap (2.2 s). The panel opens then; the
  clip finishes and the cat returns to idle behind it.
- `components/portfolio/PortfolioPanel.jsx` renders the open section (side drawer, or
  bottom sheet on phones). Close with ×, Escape or the dimmed backdrop. The cat keeps its
  position. `components/navigation/SiteMenu.jsx` opens any section directly, as
  conventional navigation.

## Folder structure

```text
src/
├─ app/            layout.jsx, page.jsx, globals.css, fonts.js, loading/error/global-error/not-found.jsx
│  └─ api/         chat/, contact/, ingest/ route handlers
├─ components/     React only (see src/components/README.md)
│  ├─ ui/  layout/  chatbot/  world/ (WorldCanvas, context, status, dev panel, fallback)
│  ├─ overlays/    InteractionPrompt; location label, minimap planned
│  ├─ navigation/  SiteMenu (conventional navigation to every section)
│  └─ portfolio/   PortfolioPanel + sections/ (one view per section, placeholders for now)
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
│  ├─ state/       createStore, worldState (engine ↔ React)
│  ├─ ai/          planned: embeddings and RAG pipeline
│  ├─ supabase/    server.js (service-role client)
│  └─ email/       resend.js
├─ hooks/          useStore (subscribe to a store slice)
├─ data/           portfolioData.js, portfolio-knowledge.js (content), portfolioSections.js,
│                  interactables.js, worldLayout.js
├─ constants/      site.js, assets.js
├─ types/          JSDoc @typedef modules (no runtime code)
└─ utils/          cn.js
public/            models/, textures/, videos/, images/, audio/  (draco/ added with the cat model)
art-source/        blender/, after-effects/  (git-ignored working files)
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
  Steps of up to 0.4 units are climbed automatically; higher ledges need a jump.
- Gravity and jump are integrated by hand (gravity 20, jump velocity 7, apex ≈1.2), with a
  short coyote time and jump buffer.
- The cat (1.6 tall, 2.3 long) is two vertical cylinders along its spine (radius 0.42,
  ±0.5 from the centre), each pushed out of axis-aligned boxes (circle vs box). That
  gives sliding along walls and keeps the nose out of them. A uniform grid keeps
  queries local. All of these values live in `CAT_METRICS` / `CAT_PLAYER`.
- The walkable boundary sits just inside the island wall; leaving it projects the cat
  back onto the edge, so it slides along the wall and cannot jump over it.
- Movement is tank-style: W/S along the facing direction, A/D turn with a little inertia.
- Interaction targets are points within 2.4 units, preferring ones the cat faces.

## Assets

- Cat: `public/models/Cat Muzna/Cat Muzna/`: `Cat.glb` plus one GLB per animation, all
  exported from the same Rigify rig (details in `public/models/README.md`). The clips are
  taken from the animation files and bound to the base model by bone name; the running
  clip's root motion is removed. If the cat fails to load, the world stays on the dev
  camera.
- Promo video: `public/videos/portfolio-intro.mp4` (After Effects export).
- Draco decoder files are copied from `three/examples/jsm/libs/draco` into
  `public/draco/` when the first compressed model is added.
