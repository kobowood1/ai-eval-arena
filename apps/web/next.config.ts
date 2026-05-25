import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@arena/db', '@arena/lib', '@arena/providers'],
};

export default nextConfig;
