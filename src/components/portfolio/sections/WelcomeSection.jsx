import { SITE } from "@/constants/site";
import { SECTIONS } from "@/data/portfolioSections";
import { ZONE_BY_ID } from "@/data/worldLayout";

import { Block, Lead, Placeholder } from "./shared";

const CONTROLS = /** @type {const} */ ([
  ["W / ↑", "Walk forward"],
  ["S / ↓", "Walk back"],
  ["A D / ← →", "Turn"],
  ["Shift", "Run"],
  ["Space", "Jump"],
  ["E", "Interact"],
  ["R", "Back to the plaza"],
  ["Esc", "Close a panel"],
]);

/** Welcome Plaza: what this place is and how to get around. */
export function WelcomeSection() {
  return (
    <div className="space-y-6">
      <Lead>{SITE.description}</Lead>
      <Placeholder>A personal welcome from Muzna will go here.</Placeholder>

      <Block title="How to explore">
        <p className="text-sm leading-relaxed text-muted">
          You are the cat. Walk up to anything marked by a glowing lantern and a gold ring, then press E. The
          signposts point the way, and the menu (top right) opens any section directly.
        </p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {CONTROLS.map(([keys, action]) => (
            <li key={keys} className="flex items-baseline gap-2">
              <kbd className="shrink-0 rounded border border-line bg-raised px-1.5 font-mono text-[11px] text-lamp">{keys}</kbd>
              <span className="text-fg/90">{action}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Places">
        <ul className="space-y-1.5 text-sm">
          {SECTIONS.filter((s) => s.id !== "welcome").map((section) => {
            const zone = ZONE_BY_ID[section.zoneId];
            return (
              <li key={section.id} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: zone?.accent }} aria-hidden="true" />
                <span className="text-fg">{zone?.name}</span>
                <span className="text-muted">· {section.title}</span>
              </li>
            );
          })}
        </ul>
      </Block>
    </div>
  );
}
