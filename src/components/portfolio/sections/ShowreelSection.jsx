"use client";

import { useState } from "react";

import { useWorld } from "@/components/world/WorldContext";
import { ASSET_PATHS } from "@/constants/assets";

import { Placeholder } from "./shared";

/**
 * Cinema: the promotional video. Until the After Effects export exists in
 * public/videos/ a placeholder is shown (and nothing is requested).
 */
export function ShowreelSection() {
  const { media } = useWorld();
  const [failed, setFailed] = useState(false);
  const missing = !media.showreel || failed;

  return (
    <div className="space-y-5">
      {missing ? (
        <Placeholder>Muzna&apos;s promotional video will play here.</Placeholder>
      ) : (
        <video
          className="aspect-video w-full rounded-xl border border-line bg-ink"
          src={ASSET_PATHS.introVideo}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        >
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}
