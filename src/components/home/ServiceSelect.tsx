"use client";

import { useId, useRef } from "react";
import type { ServiceItem } from "@/types/api";
import { CheckMark } from "./PhoneField";
import { useDropdown } from "./useDropdown";

export type ServicesState = { status: "loading" } | { status: "error" } | { status: "ready"; items: ServiceItem[] };

interface ServiceSelectProps {
  services: ServicesState;
  value: string;
  onChange: (serviceId: string) => void;
  invalid: boolean;
  describedBy: string;
  id?: string;
}

/**
 * "How Can We Help You?" — a custom select-only combobox replacing the native <select>, so the
 * open list looks the same on iOS, Android and desktop (styled like the country selector).
 * The closed field keeps the original select styling. Options come from the live services API.
 */
export function ServiceSelect({ services, value, onChange, invalid, describedBy, id = "sfmHelp" }: ServiceSelectProps) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const items = services.status === "ready" ? services.items : [];
  const selectedIndex = items.findIndex((s) => String(s.id) === value);
  const selected = selectedIndex >= 0 ? items[selectedIndex] : undefined;
  const dropdown = useDropdown<ServiceItem>({
    wrapperRef,
    items,
    selectedIndex,
    getLabel: (s) => s.title,
    onSelect: (s) => onChange(String(s.id)),
  });

  const ready = services.status === "ready";
  const label =
    services.status === "loading"
      ? "Loading services…"
      : services.status === "error"
        ? "Services unavailable"
        : (selected?.title ?? "Select Option");

  return (
    <div className="jb-dropdown" ref={wrapperRef}>
      <button
        type="button"
        id={id}
        name="service"
        role="combobox"
        className={`contact-form-section-main__select jb-dropdown__trigger${selected ? "" : " is-placeholder"}${invalid ? " is-invalid" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={dropdown.open}
        aria-controls={dropdown.open ? listId : undefined}
        aria-activedescendant={dropdown.open && items[dropdown.activeIndex] ? `${listId}-${items[dropdown.activeIndex].id}` : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        aria-busy={services.status === "loading"}
        aria-required="true"
        disabled={!ready}
        onClick={dropdown.toggle}
        onKeyDown={dropdown.onKeyDown}
      >
        <span className="jb-dropdown__value">{label}</span>
      </button>

      {dropdown.mounted && ready && (
        <ul
          className={`jb-dropdown__list jb-dropdown__list--full${dropdown.closing ? " is-closing" : ""}`}
          id={listId}
          role="listbox"
          aria-label="How can we help you?"
        >
          {items.map((service, index) => {
            const isSelected = String(service.id) === value;
            return (
              <li
                key={service.id}
                id={`${listId}-${service.id}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                className={`jb-dropdown__option jb-dropdown__option--service${isSelected ? " is-selected" : ""}${index === dropdown.activeIndex ? " is-active" : ""}`}
                onPointerEnter={() => dropdown.setActiveIndex(index)}
                onClick={() => dropdown.choose(index)}
              >
                <span className="jb-dropdown__label">{service.title}</span>
                <CheckMark visible={isSelected} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
