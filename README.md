# Muzna's Creative World

An interactive 3D web portfolio by Muzna Rizwan (BS Computer Science, Gaming & Animation,
NED University of Engineering and Technology). Visitors explore a small island town as a
cat; each location opens a part of the portfolio. A conventional menu gives direct access
to the same content.

> **Status:** project foundation (JavaScript, vanilla Three.js). The homepage is a temporary
> placeholder; the 3D world starts in Phase 4.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `src/` directory), React 19, JavaScript (.js/.jsx) |
| Styling | Tailwind CSS 4 |
| UI animation | Framer Motion |
| 3D | Vanilla Three.js |
| Physics | Custom lightweight physics (ground checks, basic collision detection) |
| Backend | Next.js route handlers, Supabase PostgreSQL + pgvector, LLM and embeddings, Resend |
| Hosting | Vercel |
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
| `npm run lint` | ESLint (Next.js core-web-vitals rules) |

Imports use the `@/` alias for `src/` (configured in `jsconfig.json`).

## Project structure

```text
src/
├── app/            Routes, root layout, fonts, global CSS, loading/error/404 pages
│   └── api/        chat, contact, ingest (stubs until their phases)
├── components/     React components only: ui/, layout/, chatbot/ (world/, overlays/, … to come)
├── lib/            supabase/, email/ (three/, physics/, state/, ai/ to come)
├── data/           Portfolio content and chatbot knowledge base
├── constants/      Site identity, asset paths
├── types/          JSDoc type definitions
└── utils/          Small helpers (cn)
public/             models/, textures/, videos/, images/, audio/
art-source/         Blender and After Effects working files (git-ignored, not served)
supabase/           pgvector migration
docs/               architecture.md
archive/            Superseded prototype code, kept for reference; not built or linted
```

The full planned structure, the engine/React boundary and the physics approach are
described in [docs/architecture.md](docs/architecture.md).

## External assets

- **Cat avatar:** export from Blender to `public/models/muzna-cat.glb`. Requirements are in
  `public/models/README.md`.
- **Promotional video:** export from After Effects to `public/videos/portfolio-intro.mp4`.
