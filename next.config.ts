import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@resvg/resvg-js"],
  turbopack: {},
};

export default withPWA(nextConfig);
