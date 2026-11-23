"use client";

import { useId, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { cities, findCity, normalizeCityText, type City } from "@/lib/cities";
import { CheckIcon, MapPinIcon } from "../icons";
import { fieldIcon, fieldInput, fieldLabel } from "./fieldStyles";

type Props = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
  listLabel: string;
  notListedText: string;
  invalid: boolean;
  describedBy?: string;
};

const MAX_RESULTS = 7;

/**
 * Searchable list of Moroccan cities (ARIA combobox). Type a few letters in Arabic or
 * Latin letters, pick with a tap or the arrow keys + Enter. A town that is not in the
 * list can still be typed freely.
 */
export function CityCombobox({
  id,
  name,
  label,
  value,
  onChange,
  locale,
  listLabel,
  notListedText,
  invalid,
  describedBy,
}: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const primary = (c: City) => (locale === "ar" ? c.ar : c.name);
  const secondary = (c: City) => (locale === "ar" ? c.name : c.ar);
  const selected = findCity(value);

  const results = useMemo(() => {
    const q = normalizeCityText(value);
    if (!q || findCity(value)) return cities.slice(0, MAX_RESULTS);
    const starts: City[] = [];
    const contains: City[] = [];
    for (const c of cities) {
      const a = normalizeCityText(c.name);
      const b = normalizeCityText(c.ar);
      if (a.startsWith(q) || b.startsWith(q)) starts.push(c);
      else if (a.includes(q) || b.includes(q)) contains.push(c);
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [value]);

  const showList = open && results.length > 0;
  const notListed = !open && value.trim().length >= 2 && !selected;

  const choose = (c: City) => {
    onChange(primary(c));
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="address-level2"
        placeholder=" "
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && showList) {
            e.preventDefault();
            const c = results[active];
            if (c) choose(c);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={fieldInput(invalid)}
      />
      <MapPinIcon className={fieldIcon()} />
      <label htmlFor={id} className={fieldLabel()}>
        {label}
      </label>

      <div
        hidden={!showList}
        className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-none border border-gold-400/20 bg-noir-900/95 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md"
      >
        <p aria-hidden="true" className="px-4 pt-3 pb-1 text-[11px] font-medium tracking-[0.14em] text-gold-400/80 ltr:uppercase">
          {listLabel}
        </p>
        <ul id={listId} role="listbox" aria-label={listLabel} className="max-h-72 overflow-y-auto p-1.5 pt-0">
          {results.map((c, i) => {
            const isSelected = selected?.name === c.name;
            return (
              <li
                key={c.name}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                // Keep the focus in the input so the tap is not lost on blur.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(c)}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-none px-3 transition-colors ${
                  i === active ? "bg-gold-400/12 text-gold-200" : "text-ivory"
                }`}
              >
                <MapPinIcon className={`size-4 shrink-0 ${i === active ? "text-gold-300" : "text-muted/70"}`} />
                <span className="flex-1 text-[15px]">{primary(c)}</span>
                <span className="text-xs text-muted">{secondary(c)}</span>
                {isSelected && <CheckIcon className="size-4 text-gold-300" />}
              </li>
            );
          })}
        </ul>
      </div>

      {notListed && <p className="mt-2 ps-1 text-xs leading-5 text-muted">{notListedText}</p>}
    </div>
  );
}
