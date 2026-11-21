import { SITE } from "@/constants/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted sm:px-6">
        © {new Date().getFullYear()} {SITE.owner}
      </div>
    </footer>
  );
}
