import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "firebase/auth";

export type UserRole = "admin" | "gov" | "user" | null;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  contactNumber?: string;
  role: UserRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastLogin?: any;
}

/**
 * Obtiene el perfil de un usuario desde Firestore.
 * Si el usuario no existe en la BD, retorna null.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }
}

/**
 * Crea o actualiza un usuario en la BD cuando se loguea.
 * IMPORTANTE: Aquí definimos el rol por defecto si es nuevo.
 */
export async function createOrUpdateUser(firebaseUser: User) {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    return userSnap.data() as UserProfile;
  }

  const newUser: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role: "user",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  };

  await setDoc(userRef, newUser);
  return newUser;
}
