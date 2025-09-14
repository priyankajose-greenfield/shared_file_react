/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',   // enables static export
  images: {
    unoptimized: true // required for GitHub Pages
  },
  basePath: "/shared_file_react", // 👈 add repo name here
  assetPrefix: "/shared_file_react/", // 👈 ensures assets load correctly
};

module.exports = nextConfig;
