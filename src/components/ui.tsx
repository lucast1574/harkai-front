"use client";
import {
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
export function Field({
  label,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}): React.JSX.Element {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${id}-hint` : undefined}
        {...props}
      />
      {(hint || error) && (
        <small id={`${id}-hint`} className={error ? "error" : "muted"}>
          {error || hint}
        </small>
      )}
    </label>
  );
}
export { Select } from "./select";
export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
}): React.JSX.Element {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} rows={5} {...props} />
    </label>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}): React.JSX.Element {
  return (
    <div
      className={error ? "notice error" : "notice"}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Heading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow || "Harkai · comunidad"}</span>
      <h1>{title}</h1>
      {children && <p className="muted">{children}</p>}
    </div>
  );
}
