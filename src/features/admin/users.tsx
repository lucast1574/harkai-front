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
  const [selected, setSelected] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("user");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  async function assign(): Promise<void> {
    if (!selected) return;
    setBusy(true);
    setActionError("");
    try {
      await api(`admin/users/${selected.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setSelected(null);
      await reload();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
    return;
  }
  return (
    <>
      <Heading title="Usuarios y roles">
        Los permisos se aplican en el backend. Los administradores existentes
        están protegidos contra cambios de rol.
      </Heading>
      {(error || actionError) && <Notice error>{error || actionError}</Notice>}
      {selected && (
        <section className="panel">
          <h2>Permisos de {selected.name}</h2>
          <p>{selected.email}</p>
          <Select
            label="Nuevo rol"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="user">Usuario</option>
            <option value="gov">Gobierno local</option>
            <option value="admin">Administrador</option>
          </Select>
          <p className="muted">
            Al confirmar darás acceso a las funciones correspondientes al rol.
          </p>
          <div className="page-actions">
            <button
              className="button"
              disabled={busy || role === selected.role}
              onClick={() => {
                void assign();
              }}
            >
              Confirmar asignación
            </button>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Cancelar
            </button>
          </div>
        </section>
      )}
      <section className="panel table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    className="text-button"
                    disabled={u.id === user?.id || u.role === "admin"}
                    onClick={() => {
                      setSelected(u);
                      setRole(u.role);
                    }}
                  >
                    Cambiar rol
                  </button>
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
