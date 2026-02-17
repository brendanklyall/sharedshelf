/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.bsky.app",
      },
      {
        protocol: "https",
        hostname: "**.bsky.network",
      },
    ],
  },
};

export default nextConfig;
