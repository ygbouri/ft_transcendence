/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_URL: process.env?.SERVER_URL,
    GAME_URL: process.env?.GAME_URL,
  },
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    domains: [
      "cdn.intra.42.fr",
      "localhost",
      "https://source.boringavatars.com",
      "https://api.dicebear.com"
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
