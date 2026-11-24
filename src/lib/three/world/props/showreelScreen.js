import * as THREE from "three";

import { ASSET_PATHS } from "@/constants/assets";

/** The reel starts when the camera comes this close to the screen, and pauses beyond STOP_DISTANCE. */
const PLAY_DISTANCE = 24;
const STOP_DISTANCE = 30;

/**
 * The cinema screen. With the promotional video in /public it shows a frame of
 * the reel (the poster image), then plays the video itself, muted and looping,
 * while the camera is near the cinema; the visitor watches it with sound in
 * the Showreel panel. Without the video it keeps the painted "SHOWREEL" canvas.
 * The screen is unlit (MeshBasicMaterial) so the footage keeps its colours.
 *
 * @param {import("../locations/common").LocationContext} ctx
 * @param {{ x: number, y: number, z: number, width: number, height: number }} placement  Local centre and size.
 */
export function createShowreelScreen(ctx, { x, y, z, width, height }) {
  const { kit, textures, media, group, origin } = ctx;
  const placement = { x, y, z, sx: width, sy: height, cast: false };

  if (!media.showreel) {
    group.add(kit.mesh(kit.geo.plane(), kit.textured("poster", textures.poster, { emissive: "#ffffff", emissiveIntensity: 0.55 }), placement));
    return;
  }

  const material = kit.tracker.track(new THREE.MeshBasicMaterial({ map: textures.poster(), toneMapped: false }));
  const screen = kit.mesh(kit.geo.plane(), material, placement);
  screen.name = "cinema-screen";
  screen.userData.dynamic = true; // keep it out of static batching: its texture changes
  group.add(screen);

  const show = (/** @type {THREE.Texture} */ texture) => {
    material.map = texture;
    material.needsUpdate = true;
  };

  /** @type {HTMLVideoElement | null} */
  let video = null;
  let started = false;
  let wanted = false;
  let failed = false;

  if (media.showreelPoster) {
    new THREE.TextureLoader().load(ASSET_PATHS.showreelPoster, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      kit.tracker.track(texture);
      if (!started) show(texture);
    });
  }

  const play = () => {
    if (!video) {
      video = document.createElement("video");
      video.src = ASSET_PATHS.introVideo;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      const videoTexture = kit.tracker.track(new THREE.VideoTexture(video));
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      // Switch from the poster to the footage once frames are actually arriving.
      video.addEventListener(
        "playing",
        () => {
          started = true;
          show(videoTexture);
        },
        { once: true }
      );
      video.addEventListener("error", () => {
        failed = true;
      });
    }
    // Muted autoplay is normally allowed; if the browser refuses, the poster stays.
    video.play().catch(() => {});
  };

  const centre = new THREE.Vector3(origin.x + x, origin.y + y, origin.z + z);
  ctx.animate((_delta, _elapsed, camera) => {
    if (failed || !camera) return;
    const distance = camera.position.distanceTo(centre);
    if (!wanted && distance < PLAY_DISTANCE) {
      wanted = true;
      play();
    } else if (wanted && distance > STOP_DISTANCE) {
      wanted = false;
      video?.pause();
    }
  });

  // Released with the rest of the world: stop the decoder and drop the file.
  kit.tracker.track({
    dispose: () => {
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
      video = null;
    },
  });
}
