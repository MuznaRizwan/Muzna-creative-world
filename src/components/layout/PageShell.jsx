import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Standard document layout (header, main, footer) for ordinary pages.
 * The 3D world will use its own full-viewport layout instead.
 * @param {{ children: import("react").ReactNode }} props
 */
export function PageShell({ children }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-20">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
