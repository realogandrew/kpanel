/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${base}/:path*`,
      },
    ];
  },
};

export default nextConfig;
