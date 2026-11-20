# 3D models (exported from Blender)

Only final `.glb` exports belong here. Source `.blend` files go in `art-source/blender/`,
which is outside the served `public/` folder.

| File | Status |
|---|---|
| `muzna-cat.glb` | Pending: the cat avatar, modelled, rigged and animated in Blender |
| `props/*.glb` | Optional: zone decoration props |

## Cat export requirements

- glTF Binary (`.glb`), +Y up, 1 Blender unit = 1 Three.js unit
- Cat faces Blender −Y (exports facing +Z); origin on the ground between the paws
- Height to ear tips 0.9–1.0 units; at most 15k triangles; textures at most 2048²
- In-place animations (no root motion) with NLA tracks named:
  `Idle`, `Walk`, `Trot`, `Run`, `JumpStart`, `JumpAir`, `JumpLand`, `Interact`, `Sit`
- Draco compression if the file exceeds 5 MB

Do not place a stand-in model at `muzna-cat.glb`. The app will show a procedural
placeholder cat until the real file exists.
