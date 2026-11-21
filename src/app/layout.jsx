import { fontVariables } from "./fonts";
import { SITE } from "@/constants/site";
import "./globals.css";

/** @type {import("next").Metadata} */
export const metadata = {
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

/** @type {import("next").Viewport} */
export const viewport = {
  themeColor: "#0f0d16",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** @param {{ children: import("react").ReactNode }} props */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
