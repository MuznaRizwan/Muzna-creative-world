# Components

Components are split by the layer they render into. 3D code never imports from the
HTML layers, and HTML components never import Three.js objects directly.

## 3D world layer (rendered inside the React Three Fiber `<Canvas>`)

| Folder | Purpose |
|---|---|
| `world/` | Canvas root, scene composition |
| `world/zones/` | One self-contained component per portfolio location |
| `world/props/` | Ground, signposts, billboards, boundaries, interactive props |
| `world/atmosphere/` | Lighting, sky, fog, particles |
| `world/triggers/` | Zone and interaction sensors |
| `avatar/` | Cat model loading, controller and animation state machine |
| `camera/` | Third-person follow camera and scripted transitions |
| `physics/` | Rapier world wrapper and collider helpers |

All 3D components are client components and are loaded without SSR.

## HTML layer (DOM over the canvas, or ordinary pages)

| Folder | Purpose |
|---|---|
| `overlays/` | HUD: location label, interaction prompt, minimap, loading screen |
| `overlays/panels/` | Portfolio panels (About, Skills, Projects, Education, Video, Contact) |
| `navigation/` | Navbar, mobile controls, keyboard hints |
| `chatbot/` | RAG chatbot drawer |
| `layout/` | Page shell for ordinary (non-3D) pages |
| `ui/` | Reusable primitives (Button, Icons, …) |
