"use client";

import { useId, useRef } from "react";
import type { CountryCode } from "libphonenumber-js/max";
import { PHONE_COUNTRIES, getPhoneCountry, sanitizePhoneInput, type PhoneCountry } from "@/lib/phone";
import { CountryFlag } from "./CountryFlag";
import { useDropdown } from "./useDropdown";

interface PhoneFieldProps {
  country: CountryCode;
  onCountryChange: (iso: CountryCode) => void;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  invalid: boolean;
  errorId: string;
  id?: string;
  buttonId?: string;
}

/**
 * International phone input: a country selector (flag, ISO code, dial code) attached to the
 * number field. The selector is an accessible select-only combobox (see useDropdown) and reuses
 * the original select styling so it sits exactly where the old country-code select was.
 */
export function PhoneField({
  country,
  onCountryChange,
  value,
  onChange,
  onBlur,
  invalid,
  errorId,
  id = "sfmPhone",
  buttonId = "sfmCountryCode",
}: PhoneFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = getPhoneCountry(country);
  const dropdown = useDropdown<PhoneCountry>({
    wrapperRef,
    items: PHONE_COUNTRIES,
    selectedIndex: PHONE_COUNTRIES.findIndex((c) => c.iso === country),
    getLabel: (c) => c.name,
    onSelect: (c) => {
      onCountryChange(c.iso);
      inputRef.current?.focus();
    },
  });

  return (
    <div className="contact-form-section-main__phone jb-phone" ref={wrapperRef}>
      <button
        type="button"
        id={buttonId}
        role="combobox"
        className="contact-form-section-main__select contact-form-section-main__select--code jb-phone__trigger"
        aria-label={`Country: ${selected.name} (${selected.dialCode})`}
        aria-haspopup="listbox"
        aria-expanded={dropdown.open}
        aria-controls={dropdown.open ? listId : undefined}
        aria-activedescendant={dropdown.open ? `${listId}-${PHONE_COUNTRIES[dropdown.activeIndex].iso}` : undefined}
        onClick={dropdown.toggle}
        onKeyDown={dropdown.onKeyDown}
      >
        <CountryFlag iso={selected.iso} />
        <span className="jb-phone__trigger-iso">{selected.iso}</span>
        <span className="jb-phone__trigger-dial">{selected.dialCode}</span>
      </button>

      {dropdown.mounted && (
        <ul
          className={`jb-dropdown__list jb-phone__list${dropdown.closing ? " is-closing" : ""}`}
          id={listId}
          role="listbox"
          aria-label="Choose a country"
        >
          {PHONE_COUNTRIES.map((option, index) => {
            const isSelected = option.iso === country;
            return (
              <li
                key={option.iso}
                id={`${listId}-${option.iso}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                className={`jb-dropdown__option jb-phone__option${isSelected ? " is-selected" : ""}${index === dropdown.activeIndex ? " is-active" : ""}`}
                onPointerEnter={() => dropdown.setActiveIndex(index)}
                onClick={() => dropdown.choose(index)}
              >
                <span className="jb-phone__chip">{option.iso}</span>
                <span className="jb-phone__name">{option.name}</span>
                <span className="jb-phone__dial">{option.dialCode}</span>
                <CheckMark visible={isSelected} />
              </li>
            );
          })}
        </ul>
      )}

      <input
        ref={inputRef}
        className={`contact-form-section-main__input${invalid ? " is-invalid" : ""}`}
        id={id}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={selected.example}
        maxLength={24}
        value={value}
        onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
        onBlur={onBlur}
        aria-describedby={errorId}
        aria-invalid={invalid ? true : undefined}
        required
      />
    </div>
  );
}

export function CheckMark({ visible }: { visible: boolean }) {
  return (
    <span className="jb-dropdown__check" aria-hidden="true">
      {visible && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
