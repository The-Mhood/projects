import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app", "*.arena.site"],
  turbopack: { root: process.cwd() },
};

export default nextConfig;
