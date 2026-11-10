"use client";
import { useRef, useState } from "react";
import { Trash2, X } from "lucide-react";
import { DeleteAccount } from "./delete-account";

export function DeleteAccountDialog({
  onDeleted,
}: {
  onDeleted: () => void;
}): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  function close(): void {
    if (busy) return;
    dialog.current?.close();
    setOpen(false);
  }
  return (
    <>
      <button
        type="button"
        className="button account-delete-button"
        onClick={() => {
          setOpen(true);
          dialog.current?.showModal();
        }}
      >
        <Trash2 size={18} />
        Eliminar cuenta
      </button>
      <dialog
        ref={dialog}
        className="account-deletion-dialog"
        aria-labelledby="delete-account-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
      >
        <div className="account-deletion-body">
          <button
            type="button"
            className="account-deletion-close"
            aria-label="Cerrar confirmación"
            disabled={busy}
            onClick={close}
            autoFocus
          >
            <X size={20} />
          </button>
          {open && (
            <DeleteAccount modal onDeleted={onDeleted} onBusyChange={setBusy} />
          )}
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={close}
          >
            Cancelar
          </button>
        </div>
      </dialog>
    </>
  );
}
