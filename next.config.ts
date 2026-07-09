import type { NextConfig } from "next";

const nextConfig = {
  serverExternalPackages: ["sequelize", "sqlite3", "sharp", "jimp"],
  /* config options here */
  allowedDevOrigins: ["d154-197-149-242-205.ngrok-free.app", "*.ngrok-free.app", "localhost:3000"]
} as any;

export default nextConfig;
