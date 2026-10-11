import type { FirebaseApp } from "@firebase/app";
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "harkai-acceso",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: "686249372758",
};
export async function firebaseApp(): Promise<FirebaseApp> {
  const { getApps, initializeApp } = await import("@firebase/app");
  return getApps()[0] || initializeApp(firebaseConfig);
}
