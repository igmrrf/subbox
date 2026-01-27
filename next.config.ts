import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@resvg/resvg-js"],
  // @ts-ignore - Next.js 16 types might not fully expose this yet or generic type issue
  turbopack: {},
};

export default withPWA(nextConfig);