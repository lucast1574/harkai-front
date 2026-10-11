import { build } from "esbuild";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const keys = ["NEXT_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_APP_ID"];
await build({entryPoints: ["src/workers/firebase-messaging.ts"], outfile: "public/firebase-messaging-sw.js", bundle: true, minify: true, platform: "browser", target: "es2020", define: Object.fromEntries(keys.map(key => [`process.env.${key}`, JSON.stringify(process.env[key] || "")]))});
