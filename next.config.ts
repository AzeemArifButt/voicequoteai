import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default. The empty turbopack config here
  // signals that we are Turbopack-aware. html2pdf.js is imported dynamically
  // inside client-side async handlers only, so no special bundler config is
  // needed — Turbopack handles it correctly via tree-shaking.
  turbopack: {},

  // Webpack config retained for environments that explicitly use --webpack.
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [...existing, "html2pdf.js", "jspdf", "html2canvas"];
    }
    return config;
  },
};

export default nextConfig;
