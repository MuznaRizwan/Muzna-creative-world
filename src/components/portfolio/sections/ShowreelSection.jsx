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
          poster={media.showreelPoster ? ASSET_PATHS.showreelPoster : undefined}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        >
          <track kind="captions" />
        </video>
      )}
      {!missing && (
        <p className="text-sm leading-relaxed text-muted">
          A 52-second introduction to Muzna&apos;s Creative World, made in Adobe After Effects: the island, the eight places,
          selected projects, skills and highlights.
        </p>
      )}
    </div>
  );
}
