import { api } from "./api";
import { firebaseApp, firebaseConfig } from "./firebase-app";
import type { Messaging, MessagePayload } from "@firebase/messaging";
export type PushZone = { latitude: number; longitude: number };
export type Subscription = PushZone & { user: string; device: string };
const storageKey = "harkai_push_zone_v1";
let messaging: Messaging | undefined;
export function pushConfigured(): boolean {
  return (
    !!firebaseConfig.apiKey && !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  );
}
export function savedSubscription(user: string): Subscription | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "null");
    return value?.user === user &&
      /^[a-f0-9]{64}$/.test(value.device) &&
      Number.isFinite(value.latitude) &&
      Number.isFinite(value.longitude)
      ? value
      : null;
  } catch {
    return null;
  }
}
async function client(): Promise<Messaging> {
  const { isSupported, getMessaging } = await import("@firebase/messaging");
  if (!pushConfigured() || !window.isSecureContext || !(await isSupported()))
    throw new Error(
      "Este navegador no tiene notificaciones disponibles todavía.",
    );
  return (messaging ||= getMessaging(await firebaseApp()));
}
export async function subscribe(
  user: string,
  zone: PushZone,
  requestPermission: boolean,
): Promise<Subscription> {
  if (!pushConfigured())
    throw new Error("Las notificaciones están pendientes de configuración.");
  if (
    requestPermission &&
    (await Notification.requestPermission()) !== "granted"
  )
    throw new Error(
      "El permiso no fue concedido. Puedes cambiarlo en tu navegador.",
    );
  if (Notification.permission !== "granted")
    throw new Error("Activa el permiso de notificación del navegador.");
  const old = localStorage.getItem(storageKey);
  if (old && !savedSubscription(user)) await clearPush(false);
  const { getToken } = await import("@firebase/messaging");
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  const token = await getToken(await client(), {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error("No se pudo registrar este navegador.");
  const result = await api<{ id: string }>("me/devices", {
    method: "PUT",
    body: JSON.stringify({ token, platform: "web", ...zone }),
  });
  const value = { ...zone, user, device: result.id };
  localStorage.setItem(storageKey, JSON.stringify(value));
  return value;
}
export async function clearPush(removeDevice = true): Promise<void> {
  let device: string | undefined;
  try {
    device = JSON.parse(localStorage.getItem(storageKey) || "null")?.device;
  } catch {}
  if (removeDevice && device && /^[a-f0-9]{64}$/.test(device))
    await api(`me/devices/${device}`, { method: "DELETE" });
  localStorage.removeItem(storageKey);
  if (pushConfigured()) {
    try {
      const { deleteToken } = await import("@firebase/messaging");
      await deleteToken(await client());
    } catch {
      /* Go session revocation remains authoritative. */
    }
  }
}
export async function listenPush(
  callback: (message: MessagePayload) => void,
): Promise<() => void> {
  const { onMessage } = await import("@firebase/messaging");
  return onMessage(await client(), callback);
}
