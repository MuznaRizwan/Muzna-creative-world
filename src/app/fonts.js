import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";

/** Display face: headings, wordmark and (later) in-world signage. */
export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

/** Body face: running text, buttons and navigation. */
export const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/** Utility face: key caps, labels, coordinates and loading progress. */
export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = [
  displayFont.variable,
  bodyFont.variable,
  monoFont.variable,
].join(" ");
