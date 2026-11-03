"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useResource } from "@/lib/use-resource";
import { api } from "@/lib/api";
import type { User, Page, Role } from "@/lib/contracts";
import { Heading, Notice, Select } from "@/components/ui";
export function Users(): React.JSX.Element {
  const { user } = useAuth();
  const [cursor, setCursor] = useState("");
  const { data, error, loading, reload } = useResource<Page<User>>(
    `admin/users?limit=50&cursor=${cursor}`,
  );
  return (
    <>
      <Heading title="Usuarios y roles">
        Selecciona un rol para guardarlo al instante. Las cuentas de
        administrador están protegidas.
      </Heading>
      {error && <Notice error>{error}</Notice>}
      <section className="panel table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ minWidth: 220 }}>
                  <RoleSelect
                    key={`${u.id}:${u.role}`}
                    account={u}
                    currentUser={user?.id}
                    onSaved={reload}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <Notice>Cargando usuarios…</Notice>}
      </section>
      <div className="page-actions">
        {cursor && (
          <button className="button secondary" onClick={() => setCursor("")}>
            Primera página
          </button>
        )}
        {data?.next_cursor && (
          <button
            className="button"
            onClick={() => setCursor(data.next_cursor || "")}
          >
            Página siguiente
          </button>
        )}
      </div>
    </>
  );
}

function RoleSelect({
  account,
  currentUser,
  onSaved,
}: {
  account: User;
  currentUser?: string;
  onSaved: () => Promise<void>;
}): React.JSX.Element {
  const [role, setRole] = useState(account.role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function assign(next: Role): Promise<void> {
    if (busy || next === role) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await api(`admin/users/${account.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: next }),
      });
      setRole(next);
      setSaved(true);
      await onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="user-role-control">
      <Select
        label={`Rol de ${account.name}`}
        value={role}
        disabled={busy || account.id === currentUser || role === "admin"}
        onChange={(e) => void assign(e.target.value as Role)}
      >
        <option value="user">Usuario</option>
        <option value="gov">Gobierno local</option>
        <option value="admin">Administrador</option>
      </Select>
      {busy && <span role="status">Guardando…</span>}
      {saved && <span role="status">Guardado</span>}
      {error && (
        <span role="alert" className="error">
          {error}
        </span>
      )}
    </div>
  );
}
