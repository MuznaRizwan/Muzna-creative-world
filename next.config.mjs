/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Serve /public images as they are. The project images are already small
    // web JPEGs, and the Vercel "services" setup in vercel.json has no
    // /_next/image optimiser (it returns 404), which left them broken live.
    unoptimized: true,
  },
};

export default nextConfig;
