/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',   // enables static export
  images: {
    unoptimized: true // required for GitHub Pages
  },
  // basePath and assetPrefix removed for Vercel root deployment
};

module.exports = nextConfig;
