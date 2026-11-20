import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muzna Rizwan | 3D Web Portfolio & Game Developer",
  description:
    "Portfolio of Muzna Rizwan, Computer Science Undergraduate specializing in Gaming & Animation at NED University of Engineering and Technology.",
  keywords: [
    "Muzna Rizwan",
    "NED University",
    "Gaming and Animation",
    "Computer Science",
    "Game Developer",
    "3D Artist",
    "Blender",
    "Three.js",
    "React Three Fiber",
    "Moral Triage",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
