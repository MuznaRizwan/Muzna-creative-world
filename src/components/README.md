# Components

`components/` holds **React components only**. The 3D world is not built from React
components: it is a vanilla Three.js engine in `src/lib/three/`, and React only mounts
its canvas and draws the interface around it.

| Folder | Purpose | Status |
|---|---|---|
| `ui/` | Reusable primitives (Button, Icons, …) | Exists |
| `layout/` | Page shell (header, main, footer) for ordinary pages | Exists |
| `chatbot/` | RAG chatbot drawer | Exists (UI stub) |
| `world/` | Client-only mount for the Three.js engine (`WorldCanvas.jsx`), loading/error states, temporary dev panel, no-WebGL fallback | Exists |
| `overlays/` | HUD over the canvas: interaction prompt (exists); location label, minimap | Partly exists |
| `navigation/` | Site menu (every section, no exploring needed); mobile joystick later | Partly exists |
| `portfolio/` | The reusable portfolio panel and one view per section (`sections/`) | Exists (placeholder content) |

Folders marked *Planned* are created when their first component is written.

## Rules

- Never import `three` or anything from `src/lib/three/` into a component other than
  `world/`. Overlays read the world state with `useWorld()` (context) and `useStore()`,
  and call only a few engine methods (`requestInteract`, `focusLocation`).
- The canvas mount must be a client component that loads the engine with
  `next/dynamic(..., { ssr: false })`; Three.js needs the browser.
- Per-frame values (cat position, velocity) never go through React state.
