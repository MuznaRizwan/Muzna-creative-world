import { existsSync } from "node:fs";
import path from "node:path";

import { WorldCanvas } from "@/components/world/WorldCanvas";
import { WorldFallback } from "@/components/world/WorldFallback";
import { ASSET_PATHS } from "@/constants/assets";

/** Is an optional file in /public yet? Checked on the server, so the browser never requests a missing file. */
function hasPublicFile(/** @type {string} */ url) {
  return existsSync(path.join(process.cwd(), "public", ...url.split("/").filter(Boolean)));
}

export default function HomePage() {
  const media = {
    showreel: hasPublicFile(ASSET_PATHS.introVideo),
    showreelPoster: hasPublicFile(ASSET_PATHS.showreelPoster),
    studioPainting: hasPublicFile(ASSET_PATHS.studioPainting),
  };
  return <WorldCanvas fallback={<WorldFallback />} media={media} />;
}
