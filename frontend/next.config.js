/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // We enforce linting in CI or via `npm run lint`, but don't fail production builds on lint errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
