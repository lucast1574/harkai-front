import { firebaseApp } from "./firebase-app";
export function googleConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}
export async function googleToken(): Promise<string> {
  if (!googleConfigured())
    throw new Error("El acceso con Google está pendiente de configuración.");
  const [
    {
      getAuth,
      GoogleAuthProvider,
      signInWithPopup,
      setPersistence,
      inMemoryPersistence,
      signOut,
    },
  ] = await Promise.all([import("@firebase/auth")]);
  const app = await firebaseApp();
  const auth = getAuth(app);
  await setPersistence(auth, inMemoryPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  try {
    return await result.user.getIdToken(true);
  } finally {
    await signOut(auth);
  }
}
