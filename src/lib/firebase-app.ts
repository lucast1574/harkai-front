import type { FirebaseApp } from "@firebase/app";
const envAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    !envAuthDomain || envAuthDomain.endsWith(".firebaseapp.com")
      ? "panel.harkai.lat"
      : envAuthDomain,
  projectId: "harkai-acceso",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: "686249372758",
};
export async function firebaseApp(): Promise<FirebaseApp> {
  const { getApps, initializeApp } = await import("@firebase/app");
  return getApps()[0] || initializeApp(firebaseConfig);
}
