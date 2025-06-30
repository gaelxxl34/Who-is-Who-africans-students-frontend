/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["readdy.ai"], // Add the external image domain
    remotePatterns: [
      {
        protocol: "https",
        hostname: "readdy.ai",
        port: "",
        pathname: "/api/search-image/**",
      },
    ],
  },
};

module.exports = nextConfig;
