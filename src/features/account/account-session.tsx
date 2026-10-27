"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Notice } from "@/components/ui";
import { LogOut } from "lucide-react";
export function AccountSession(): React.JSX.Element {
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function leave(): Promise<void> {
    setBusy(true);
    setError("");
    try {
      await logout();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <section className="panel account-session">
      <div>
        <h2>Cerrar esta sesión</h2>
        <p className="muted small">
          Solo saldrás de este navegador. Tu sesión móvil seguirá activa.
        </p>
        {error && <Notice error>{error}</Notice>}
      </div>
      <button
        className="button secondary"
        disabled={busy}
        onClick={() => void leave()}
      >
        <LogOut size={17} />
        {busy ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
    </section>
  );
}
