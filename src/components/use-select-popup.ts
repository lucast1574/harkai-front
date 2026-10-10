"use client";
import {
  useEffect,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from "react";

import { selectPosition } from "./select-position";
type Position = ReturnType<typeof selectPosition>;
type Popup = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  trigger: RefObject<HTMLButtonElement | null>;
  menu: RefObject<HTMLDivElement | null>;
  native: RefObject<HTMLSelectElement | null>;
  setLocalValue: Dispatch<SetStateAction<string>>;
  active: number;
  count: number;
  setPosition: Dispatch<SetStateAction<Position>>;
};
export function useSelectPopup({
  open,
  setOpen,
  trigger,
  menu,
  native,
  setLocalValue,
  active,
  count,
  setPosition,
}: Popup): void {
  useEffect(() => {
    const form = native.current?.form;
    const reset = (): void => {
      queueMicrotask(() => {
        if (native.current) setLocalValue(native.current.value);
      });
    };
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [native, setLocalValue]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent): void => {
      if (
        event.target instanceof Node &&
        !trigger.current?.contains(event.target) &&
        !menu.current?.contains(event.target)
      )
        setOpen(false);
    };
    const close = (): void => setOpen(false);
    const scroll = (event: Event): void => {
      if (event.target !== menu.current && trigger.current) {
        const rect = trigger.current.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) close();
        else setPosition(selectPosition(trigger.current, count));
      }
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [open, setOpen, trigger, menu, count, setPosition]);
  useEffect(() => {
    const list = menu.current;
    const option =
      list?.querySelectorAll<HTMLElement>('[role="option"]')[active];
    if (!list || !option) return;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < list.scrollTop) list.scrollTo({ top });
    else if (bottom > list.scrollTop + list.clientHeight)
      list.scrollTo({ top: bottom - list.clientHeight });
  }, [active, menu, open]);
}
