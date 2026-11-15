"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SERVICE_NAV } from "@/lib/service-pages";

// Desktop layout with a real mouse: the menu also opens on hover
const HOVER_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 992px)";

/**
 * Header "Services" item: a dropdown trigger (no page of its own) for the six service pages
 * (styles: styles/original/additions.css). One open state drives the menu, the arrow and
 * aria-expanded, whether it was opened by hover (desktop), click/tap or keyboard:
 *  - hover opens it and leaving closes it, unless it was opened by a click;
 *  - click/tap toggles it (a click while hover-opened keeps it open);
 *  - Enter/Space toggle, ArrowDown/ArrowUp open it and move through the services,
 *    Escape closes it and returns focus to Services; tabbing away or clicking outside closes it.
 */
export function ServicesNavItem({ active, currentSlug }: { active: boolean; currentSlug?: string }) {
  const [open, setOpen] = useState(false);
  const openedBy = useRef<"hover" | "click" | null>(null);
  const itemRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const show = (by: "hover" | "click") => {
    openedBy.current = by;
    setOpen(true);
  };
  const hide = () => {
    openedBy.current = null;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!itemRef.current?.contains(event.target as Node)) hide();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const links = () => Array.from(itemRef.current?.querySelectorAll<HTMLAnchorElement>(".site-header-main__submenu-link") ?? []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    if (event.key === "Escape" && open) {
      hide();
      triggerRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = links();
    const index = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.key === "ArrowDown" ? (index + 1) % items.length : index <= 0 ? items.length - 1 : index - 1;
    show("click");
    // The list becomes visible on this render; focus once it is
    requestAnimationFrame(() => links()[next]?.focus());
  };

  return (
    <li
      ref={itemRef}
      className={`nav-item site-header-main__dropdown${open ? " is-open" : ""}`}
      onKeyDown={onKeyDown}
      onMouseEnter={() => {
        if (!open && window.matchMedia?.(HOVER_QUERY).matches) show("hover");
      }}
      onMouseLeave={() => {
        if (openedBy.current === "hover") hide();
      }}
      onBlur={(event) => {
        if (!itemRef.current?.contains(event.relatedTarget as Node)) hide();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`site-header-main__link site-header-main__dropdown-trigger${active ? " is-active" : ""}`}
        aria-expanded={open}
        aria-controls="siteHeaderServicesMenu"
        onClick={() => {
          if (open && openedBy.current === "hover") openedBy.current = "click"; // keep it open: the click means "show me"
          else if (open) hide();
          else show("click");
        }}
      >
        Services
        <svg className="site-header-main__dropdown-arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      <div className="site-header-main__submenu-wrap">
        <ul className="site-header-main__submenu" id="siteHeaderServicesMenu" aria-label="Our services">
          {SERVICE_NAV.map((service) => (
            <li key={service.slug}>
              <Link
                className="site-header-main__submenu-link"
                href={service.href}
                aria-current={service.slug === currentSlug ? "page" : undefined}
                onClick={hide}
              >
                {service.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
