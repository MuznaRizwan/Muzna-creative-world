/**
 * The site's name in the top-left corner of the 3D view (the page's main
 * heading while the world is shown). Always visible; the developer panel adds
 * its camera line underneath only in development.
 */
export function SiteTitle() {
  return (
    <div className="pointer-events-none absolute left-0 top-0 max-w-[calc(100%-13rem)] p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-base font-bold tracking-tight drop-shadow">Muzna&apos;s Creative World</h1>
    </div>
  );
}
