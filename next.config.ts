import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: "standalone" output is for Docker/self-hosting ONLY.
  // For Vercel deployment, this MUST be removed (Vercel handles its own output format).
  // output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
