import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "app20.susalud.gob.pe",
        port: "8080",
        pathname: "/registro-renipress-webapp/ipress.htm",
      },
    ],
  },
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
