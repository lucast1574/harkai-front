import { initializeApp } from "@firebase/app";
import { getMessaging } from "@firebase/messaging/sw";
// FCM displays background notification payloads once; no second showNotification.
// Links are fixed to the report URL by the Go sender, never provided by users.
getMessaging(initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "harkai-acceso",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: "686249372758",
}));
