import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://harkai-acceso.firebaseapp.com/__/auth/:path*",
      },
      {
        source: "/__/firebase/:path*",
        destination: "https://harkai-acceso.firebaseapp.com/__/firebase/:path*",
      },
    ];
  },
};
export default config;
