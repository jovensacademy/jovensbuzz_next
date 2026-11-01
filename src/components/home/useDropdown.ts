"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";

const CLOSE_ANIMATION_MS = 140;

/**
 * Shared behaviour for the contact form's custom listbox dropdowns (country + service):
 * select-only combobox keyboard support, outside-click closing and an open/close animation.
 */
export function useDropdown<T>({
  wrapperRef,
  items,
  selectedIndex,
  onSelect,
  getLabel,
}: {
  /** Element containing the trigger and list (outside clicks close the list). */
  wrapperRef: RefObject<HTMLElement | null>;
  items: T[];
  selectedIndex: number;
  onSelect: (item: T) => void;
  getLabel?: (item: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const closeTimer = useRef<number | undefined>(undefined);

  const openList = () => {
    window.clearTimeout(closeTimer.current);
    setClosing(false);
    setActiveIndex(Math.max(0, selectedIndex));
    setOpen(true);
  };

  const closeList = () => {
    if (!open) return;
    setOpen(false);
    setClosing(true);
    closeTimer.current = window.setTimeout(() => setClosing(false), CLOSE_ANIMATION_MS);
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) closeList();
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
    // closeList only reads `open`, which is this effect's dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, wrapperRef]);

  // Keep the highlighted option scrolled into view in long lists
  useEffect(() => {
    if (!open) return;
    wrapperRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex, wrapperRef]);

  const choose = (index: number) => {
    const item = items[index];
    if (item === undefined) return;
    onSelect(item);
    closeList();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (items.length === 0) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % items.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeList();
        break;
      case "Tab":
        closeList();
        break;
      default:
        // Type-ahead: jump to the next option starting with the typed letter
        if (getLabel && event.key.length === 1 && /\S/.test(event.key)) {
          const key = event.key.toLowerCase();
          for (let step = 1; step <= items.length; step++) {
            const index = (activeIndex + step) % items.length;
            if (getLabel(items[index]).toLowerCase().startsWith(key)) {
              setActiveIndex(index);
              break;
            }
          }
        }
    }
  };

  return {
    open,
    /** Render the list while open or animating closed. */
    mounted: open || closing,
    closing,
    activeIndex,
    setActiveIndex,
    openList,
    closeList,
    toggle: () => (open ? closeList() : openList()),
    choose,
    onKeyDown,
  };
}
