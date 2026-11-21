import Link from "next/link";

import { SITE } from "@/constants/site";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          {SITE.name}
        </Link>
      </div>
    </header>
  );
}
