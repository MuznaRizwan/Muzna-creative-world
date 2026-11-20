# Muzna's Creative World

An interactive 3D web portfolio by Muzna Rizwan (BS Computer Science, Gaming & Animation,
NED University of Engineering and Technology). Visitors explore a small island town as a
cat; each location opens a part of the portfolio. A conventional menu gives direct access
to the same content.

> **Status:** Phase 3, project foundation. The homepage is a temporary placeholder.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `src/` directory), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| UI animation | Framer Motion |
| 3D | Three.js, React Three Fiber, Drei |
| Physics | Rapier (`@react-three/rapier`) |
| Backend | Next.js route handlers, Supabase (pgvector), Resend |
| Assets | Blender (cat, props), Adobe After Effects (promo video) |

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # fill in values when the backend phases start
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run type-check` | TypeScript check without emitting |

## Project structure

```text
src/
├── app/                 Routes, root layout, fonts, global CSS, loading/error/404, API routes
│   └── api/             chat, contact, ingest (stubs until their phases)
├── components/
│   ├── world/           3D: canvas, scene, zones/, props/, atmosphere/, triggers/
│   ├── avatar/          3D: cat model, controller, animations
│   ├── camera/          3D: follow camera, transitions
│   ├── physics/         3D: Rapier wrapper, collider helpers
│   ├── overlays/        HTML: HUD and portfolio panels/
│   ├── navigation/      HTML: navbar, mobile controls, key hints
│   ├── chatbot/         HTML: chatbot drawer
│   ├── layout/          HTML: page shell for ordinary pages
│   └── ui/              HTML: reusable primitives
├── data/                Portfolio content and chatbot knowledge base (single source of truth)
├── hooks/               Custom React hooks
├── lib/                 constants, utils/, supabase/, email/, ai/
└── types/               Shared TypeScript types
public/
├── models/              Blender exports (muzna-cat.glb goes here)
├── textures/  videos/  images/  audio/
art-source/              Blender and After Effects working files (git-ignored, not served)
supabase/migrations/     pgvector schema
archive/                 Superseded prototype code, kept for reference; not built or linted
```

See `src/components/README.md` for the rule that keeps 3D and HTML components apart.

## External assets

- **Cat avatar:** export from Blender to `public/models/muzna-cat.glb`. Requirements are in
  `public/models/README.md`.
- **Promotional video:** export from After Effects to `public/videos/portfolio-intro.mp4`.
