"use client";

import {
  Children,
  isValidElement,
  useId,
  useMemo,
  useRef,
  useState,
  type SelectHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useSelectPopup } from "./use-select-popup";
import styles from "./select.module.css";
import { selectPosition } from "./select-position";

type Option = { value: string; label: ReactNode; disabled?: boolean };
type Props = SelectHTMLAttributes<HTMLSelectElement> & { label: string };

function readOptions(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap((child) => {
    if (
      !isValidElement<{
        value?: string | number;
        children?: ReactNode;
        disabled?: boolean;
      }>(child)
    )
      return [];
    if (child.type !== "option") return readOptions(child.props.children);
    return [
      {
        value: String(child.props.value ?? child.props.children ?? ""),
        label: child.props.children,
        disabled: child.props.disabled,
      },
    ];
  });
}

export function Select({
  label,
  children,
  value,
  defaultValue,
  onChange,
  disabled,
  ...props
}: Props): React.JSX.Element {
  const id = useId();
  const native = useRef<HTMLSelectElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const options = useMemo(() => readOptions(children), [children]);
  const [localValue, setLocalValue] = useState(
    String(defaultValue ?? options[0]?.value ?? ""),
  );
  const selectedValue = String(value ?? localValue);
  const selected = options.findIndex(
    (option) => option.value === selectedValue,
  );
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    maxHeight: 280,
  });
  const search = useRef({ text: "", time: 0 });
  useSelectPopup({
    open,
    setOpen,
    trigger,
    menu,
    native,
    setLocalValue,
    setPosition,
    count: options.length,
    active,
  });

  function show(): void {
    if (disabled || !trigger.current) return;
    setPosition(selectPosition(trigger.current, options.length));
    setActive(
      selected >= 0 && !options[selected]?.disabled
        ? selected
        : Math.max(
            0,
            options.findIndex((option) => !option.disabled),
          ),
    );
    setOpen(true);
  }

  function choose(index: number): void {
    const option = options[index];
    if (!option || option.disabled || !native.current) return;
    native.current.value = option.value;
    native.current.dispatchEvent(new Event("change", { bubbles: true }));
    setInvalid(false);
    setOpen(false);
    trigger.current?.focus();
  }

  function move(direction: number): void {
    for (let step = 1; step <= options.length; step++) {
      const index =
        (active + direction * step + options.length) % options.length;
      if (!options[index]?.disabled) {
        setActive(index);
        return;
      }
    }
  }

  function keyboard(event: KeyboardEvent<HTMLButtonElement>): void {
    if (event.key === "Tab" || event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (
      ["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"].includes(event.key)
    ) {
      event.preventDefault();
      if (!open) {
        show();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp")
        move(event.key === "ArrowDown" ? 1 : -1);
      else if (event.key === "Home")
        setActive(
          Math.max(
            0,
            options.findIndex((option) => !option.disabled),
          ),
        );
      else if (event.key === "End")
        setActive(options.findLastIndex((option) => !option.disabled));
      else choose(active);
      return;
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const now = Date.now();
      search.current = {
        text:
          now - search.current.time < 700
            ? search.current.text + event.key
            : event.key,
        time: now,
      };
      const index = options.findIndex(
        (option) =>
          !option.disabled &&
          String(option.label)
            .toLocaleLowerCase()
            .startsWith(search.current.text.toLocaleLowerCase()),
      );
      if (!open) show();
      if (index >= 0) setActive(index);
    }
  }

  return (
    <div className="field">
      <label id={`${id}-label`} htmlFor={`${id}-trigger`}>
        {label}
      </label>
      <select
        {...props}
        ref={native}
        className={styles.native}
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          setLocalValue(event.target.value);
          onChange?.(event);
        }}
        onInvalid={(event) => {
          event.preventDefault();
          setInvalid(true);
          trigger.current?.focus();
        }}
      >
        {children}
      </select>
      <button
        ref={trigger}
        id={`${id}-trigger`}
        type="button"
        role="combobox"
        className={styles.trigger}
        disabled={disabled}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-option-${active}` : undefined}
        aria-invalid={invalid || props["aria-invalid"]}
        aria-required={props.required}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={keyboard}
      >
        <span id={`${id}-value`}>
          {options[selected]?.label ?? options[0]?.label ?? "Selecciona"}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={open ? styles.rotated : undefined}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {invalid && <small className="error">Selecciona una opción.</small>}
      {open &&
        createPortal(
          <div
            ref={menu}
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            className={styles.menu}
            style={position}
            onPointerDown={(event) => event.preventDefault()}
          >
            {options.map((option, index) => (
              <div
                id={`${id}-option-${index}`}
                key={`${option.value}-${index}`}
                role="option"
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled || undefined}
                className={`${styles.option} ${active === index ? styles.active : ""}`}
                onPointerMove={() => {
                  if (!option.disabled) setActive(index);
                }}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                {option.value === selectedValue && (
                  <span aria-hidden="true" className={styles.check}>
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
