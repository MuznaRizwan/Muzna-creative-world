# Art source files

Source files for the assets the website uses. Nothing here is served by the website or
imported by the code; the exported results live in `public/`.

| Folder | Contents | Exported to |
|---|---|---|
| `blender/cat/` | `Cat.blend` (model, materials, textures, Rigify rig) and one `.blend` per animation: `Cat IDLE`, `Cat Waliking`, `Cat running`, `Cat General interaction`. `web-export-originals/` holds the animation GLBs exactly as exported from Blender. | `public/models/Cat Muzna/Cat Muzna/*.glb` |
| `after-effects/` | `promotionalvideo.aep` (the 52 s promo), the earlier 44 s version, the footage it links to, and the ExtendScript files used to build and render it. See `after-effects/README.txt`. | `public/videos/portfolio-intro.mp4` |
| `fonts/` | Licences for the site's fonts (Bricolage Grotesque, Manrope, JetBrains Mono; SIL Open Font License). The site loads them from Google Fonts. | |

Not in the repository:

- The Mixkit music and sound-effect files. Their licence allows using them in the video but
  not sharing the files themselves. `after-effects/audio/LICENSES.txt` lists each file and
  where it is used; download them from mixkit.co into `after-effects/audio/music` and
  `after-effects/audio/sfx` to re-render. The final MP4 already contains the audio.
- The lossless render (`after-effects/render/`, about 2.2 GB) and After Effects auto-saves
  and logs.
