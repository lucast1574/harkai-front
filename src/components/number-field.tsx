"use client";
import { useId, useRef, type InputHTMLAttributes } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import styles from "./number-field.module.css";

export type NumberFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function NumberField({
  label,
  hint,
  error,
  min,
  max,
  step,
  disabled,
  readOnly,
  className,
  ...props
}: NumberFieldProps): React.JSX.Element {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function adjust(direction: 1 | -1): void {
    const el = inputRef.current;
    if (!el || disabled || readOnly) return;
    const rawStep =
      step !== undefined && step !== "any" ? Number(step) : undefined;
    const stepVal =
      rawStep && Number.isFinite(rawStep) && rawStep > 0
        ? rawStep
        : step === "any"
          ? 0.001
          : 1;
    const current = Number(el.value);
    const base = Number.isFinite(current)
      ? current
      : min !== undefined && Number.isFinite(Number(min))
        ? Number(min)
        : 0;
    const decimals = (String(stepVal).split(".")[1] || "").length;
    let next = Number((base + direction * stepVal).toFixed(decimals));
    if (min !== undefined && Number.isFinite(Number(min))) {
      next = Math.max(Number(min), next);
    }
    if (max !== undefined && Number.isFinite(Number(max))) {
      next = Math.min(Number(max), next);
    }
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(el, String(next));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={styles.wrapper}>
        <input
          {...props}
          ref={inputRef}
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          className={className ? `${styles.input} ${className}` : styles.input}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-hint` : undefined}
        />
        {!readOnly && (
          <div className={styles.stepper} aria-hidden="true">
            <button
              type="button"
              tabIndex={-1}
              className={styles.stepButton}
              disabled={disabled}
              aria-label={`Incrementar ${label}`}
              onClick={() => adjust(1)}
            >
              <ChevronUp size={12} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              tabIndex={-1}
              className={styles.stepButton}
              disabled={disabled}
              aria-label={`Disminuir ${label}`}
              onClick={() => adjust(-1)}
            >
              <ChevronDown size={12} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
      {(hint || error) && (
        <small id={`${id}-hint`} className={error ? "error" : "muted"}>
          {error || hint}
        </small>
      )}
    </div>
  );
}
