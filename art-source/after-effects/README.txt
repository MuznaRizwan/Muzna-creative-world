Muzna's Creative World: promotional video (After Effects 2021)
==============================================================
promotionalvideo.aep     Editable project. Open the comp 01_Comps > MAIN_Promo_52s
                         (52 s, 1920x1080, 30 fps). Each scene is its own comp in 01_Comps > Scenes.
promotionalvideo_v1_44s.aep  Backup of the first 44 s version (before the LinkedIn update, 2026-11-23).
footage/stills/          Screenshots captured from the running portfolio site (1920x1080).
footage/projects/        Project images for the Selected Projects scene (from profile/).
audio/music, audio/sfx   Licensed audio (see audio/LICENSES.txt).
scripts/                 ExtendScript files used to build and render the project:
  build-promo.jsx        builds the whole project in an empty AE project
  fix-pass-1/2.jsx       small corrections applied after the first preview
  update-linkedin.jsx    2026-11-23: name -> MUZNA ZUBAIRY, adds S6b_Projects + S6c_Highlights, MAIN -> 52 s
  add-audio.jsx          places the audio files at the markers (re-runnable)
  preview-frames.jsx     saves a few still frames of MAIN for checking
  render-frames.jsx      renders MAIN in the AE window (unreliable here; use aerender below)
Render from the command line (reliable):
  "C:\Program Files\Adobe\Adobe After Effects 2021\Support Files\aerender.exe" -project promotionalvideo.aep
         -comp MAIN_Promo_52s -OMtemplate Lossless -output render\promo_lossless.avi
render/                  Lossless intermediate render (large; can be deleted after encoding).

Final video: public/videos/portfolio-intro.mp4 (H.264 + AAC), encoded from render/promo_lossless.avi with:
  ffmpeg -i render/promo_lossless.avi -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p
         -profile:v high -level 4.1 -c:a aac -b:a 192k -movflags +faststart public/videos/portfolio-intro.mp4

Fonts: text layers are named by role (DISPLAY / BODY / MONO). The site uses Bricolage Grotesque,
Manrope and JetBrains Mono (free, SIL Open Font License, fonts.google.com). The project currently
uses Segoe UI / Consolas; swap the font on those layers once the site fonts are installed.

Editing tips: text is live (double-click to edit); timings are keyframes on each layer (press U to
show them); audio volume is Audio Levels on the "AUDIO ..." layers in MAIN; markers on MAIN show
where each sound belongs.
