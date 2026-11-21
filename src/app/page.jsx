import { WorldCanvas } from "@/components/world/WorldCanvas";
import { WorldFallback } from "@/components/world/WorldFallback";

/** Home: the 3D environment preview (Phase 4). Without WebGL, the placeholder page is shown. */
export default function HomePage() {
  return <WorldCanvas fallback={<WorldFallback />} />;
}
