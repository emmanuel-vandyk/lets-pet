import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false,
  images: {
    domains: ["letspet-server.vercel.app"],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
