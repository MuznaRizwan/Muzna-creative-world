/**
 * Public URLs of externally created assets (Blender, After Effects).
 * The files are produced outside this codebase and dropped into /public.
 */
export const ASSET_PATHS = Object.freeze({
  introVideo: "/videos/portfolio-intro.mp4",
  /** A frame of the intro video: the showreel panel's poster and the cinema screen before it plays. */
  showreelPoster: "/images/showreel-poster.jpg",
  /** Muzna's acrylic painting, shown on the Creative Studio's giant easel. */
  studioPainting: "/images/studio-painting.jpg",
});

/**
 * Which optional media files exist in /public (checked on the server, so the
 * browser never requests a missing one).
 * @typedef {{ showreel: boolean, showreelPoster: boolean, studioPainting: boolean }} MediaFlags
 */

const CAT_FOLDER = "/models/Cat Muzna/Cat Muzna";

/**
 * The cat avatar, exported from Blender as five GLBs that share one Rigify
 * skeleton: the base model, and one file per animation. Each animation file
 * contains a full copy of the cat; only its `rigAction` clip is used.
 * Paths contain spaces, so they are URL-encoded here.
 */
export const CAT_ASSETS = Object.freeze({
  model: encodeURI(`${CAT_FOLDER}/Cat.glb`),
  clips: Object.freeze({
    idle: encodeURI(`${CAT_FOLDER}/Cat IDLE.glb`),
    walk: encodeURI(`${CAT_FOLDER}/Cat Waliking.glb`),
    run: encodeURI(`${CAT_FOLDER}/Cat running.glb`),
    interact: encodeURI(`${CAT_FOLDER}/Cat General interaction.glb`),
  }),
});
