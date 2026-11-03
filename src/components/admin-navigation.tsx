"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Settings2 } from "lucide-react";

export function AdminNavigation({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}): React.JSX.Element {
  const [open, setOpen] = useState(active);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent): void {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div
      ref={root}
      className="admin-navigation"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          const links = [
            ...(root.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []),
          ];
          const index = links.indexOf(
            document.activeElement as HTMLAnchorElement,
          );
          links[
            (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) %
              links.length
          ]?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={`nav-link admin-navigation-trigger${active ? " active" : ""}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span className="nav-icon">
          <Settings2 size={20} />
        </span>
        <span className="nav-text">Administración</span>
        <ChevronDown size={16} className={open ? "expanded" : ""} />
      </button>
      <div id={id} hidden={!open} className="admin-navigation-links">
        {children}
      </div>
    </div>
  );
}
