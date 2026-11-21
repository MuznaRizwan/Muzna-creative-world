# 3D models (exported from Blender)

## The cat avatar

`Cat Muzna/Cat Muzna/` holds Muzna's cat, exported with the Khronos glTF Blender I/O 5.1:

| File | Used for | Clip used |
|---|---|---|
| `Cat.glb` | The model shown in the world (mesh, materials, textures, rig) | none (its action is a static pose) |
| `Cat IDLE.glb` | Idle (3.1 s, loops) | `rigAction` |
| `Cat Waliking.glb` | Walking (1.2 s, loops) | `rigAction` |
| `Cat running.glb` | Running (1.0 s, loops; root motion removed) | `rigAction` |
| `Cat General interaction.glb` | Interaction: look, sniff, paw tap (3.2 s, plays once) | `rigAction` |

All five files share the same Rigify armature (`rig`, 765 bones): same bone names, hierarchy,
rest pose and inverse bind matrices. So the clips bind to `Cat.glb` by bone name with no
retargeting. Each animation file also contains its own copy of the cat. Those copies are not
identical: the idle and walking files hold only half the mesh, and the running file holds a
subdivided one. They are never shown and are discarded after their clips are extracted.

How the engine prepares `Cat.glb` (`src/lib/three/avatar/CatModel.js`):

- It removes `metarig`, an unused template armature, and about 275 empty `WGT-rig_*` widget
  objects.
- It re-parents the jacket trim discs (`Circle`, `Circle.005`, `Circle.006`) to the jacket,
  so they follow the spine.
- It hides `Cube.001`, the box the cat taps in the interaction animation. In the world, the
  cat interacts with real objects instead.
- It scales the model uniformly so the ear tips are 0.95 units high. The model faces +Z.

### Notes for future exports

- If the animations are re-exported, keep the armature action named `rigAction`, or adjust
  `src/lib/three/avatar/catClips.js`.
- Export animation files with *only* the armature action (no mesh) to cut download size.
  At the moment each one carries a full copy of the cat, about 1.2–1.5 MB compressed.
- The `.blend` source files sit next to the GLBs inside `public/`, so they would be served
  and deployed. Moving them to `art-source/blender/` keeps them out of the site.

## Other models

| File | Status |
|---|---|
| `props/*.glb` | Optional: zone decoration props |

Only final `.glb` exports belong in `public/`. Source `.blend` files go in `art-source/blender/`.
Use Draco compression if a file exceeds 5 MB.
