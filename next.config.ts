import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sequelize", "sqlite3", "sharp", "jimp"],
  /* config options here */
};

export default nextConfig;
