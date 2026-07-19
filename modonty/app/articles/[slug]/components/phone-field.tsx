"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * International phone input — no external library (bundle-safe for modonty).
 * Country default comes from Vercel geo (x-vercel-ip-country, passed as `defaultCountry`);
 * the visitor can change it. Emits E.164 (`+<dial><national>`) via onChange.
 * Validation is per selected country (the markets we serve + a permissive fallback).
 */

interface Country {
  code: string; // ISO 3166-1 alpha-2
  dial: string; // country calling code, no +
  flag: string;
  name: string;
  // national number length range (digits after the dial code), for the green tick
  min: number;
  max: number;
}

// Markets we serve first, then common GCC/Arab + a few globals.
const COUNTRIES: Country[] = [
  { code: "SA", dial: "966", flag: "🇸🇦", name: "السعودية", min: 9, max: 9 },
  { code: "EG", dial: "20", flag: "🇪🇬", name: "مصر", min: 10, max: 10 },
  { code: "AE", dial: "971", flag: "🇦🇪", name: "الإمارات", min: 9, max: 9 },
  { code: "KW", dial: "965", flag: "🇰🇼", name: "الكويت", min: 8, max: 8 },
  { code: "QA", dial: "974", flag: "🇶🇦", name: "قطر", min: 8, max: 8 },
  { code: "BH", dial: "973", flag: "🇧🇭", name: "البحرين", min: 8, max: 8 },
  { code: "OM", dial: "968", flag: "🇴🇲", name: "عُمان", min: 8, max: 8 },
  { code: "JO", dial: "962", flag: "🇯🇴", name: "الأردن", min: 9, max: 9 },
  { code: "IQ", dial: "964", flag: "🇮🇶", name: "العراق", min: 10, max: 10 },
  { code: "LB", dial: "961", flag: "🇱🇧", name: "لبنان", min: 7, max: 8 },
  { code: "MA", dial: "212", flag: "🇲🇦", name: "المغرب", min: 9, max: 9 },
  { code: "DZ", dial: "213", flag: "🇩🇿", name: "الجزائر", min: 9, max: 9 },
  { code: "US", dial: "1", flag: "🇺🇸", name: "أمريكا/كندا", min: 10, max: 10 },
  { code: "GB", dial: "44", flag: "🇬🇧", name: "بريطانيا", min: 9, max: 10 },
  { code: "TR", dial: "90", flag: "🇹🇷", name: "تركيا", min: 10, max: 10 },
];

const DEFAULT = COUNTRIES[0];

function resolveDefault(iso?: string | null): Country {
  if (!iso) return DEFAULT;
  return COUNTRIES.find((c) => c.code === iso.toUpperCase()) ?? DEFAULT;
}

export interface PhoneFieldValue {
  e164: string; // +<dial><national>, or "" if empty
  valid: boolean;
}

interface PhoneFieldProps {
  defaultCountry?: string | null;
  /** Called on every change with the composed E.164 + validity. */
  onChange: (v: PhoneFieldValue) => void;
  /** Fired on first interaction — powers the booking_form_start funnel event. */
  onFirstTouch?: () => void;
  id?: string;
}

export function PhoneField({ defaultCountry, onChange, onFirstTouch, id = "booking-phone" }: PhoneFieldProps) {
  const [country, setCountry] = useState<Country>(() => resolveDefault(defaultCountry));
  const [national, setNational] = useState("");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const valid = useMemo(() => {
    const len = national.replace(/\D/g, "").length;
    return len >= country.min && len <= country.max;
  }, [national, country]);

  function emit(nextCountry: Country, nextNational: string) {
    const digits = nextNational.replace(/\D/g, "");
    const len = digits.length;
    const ok = len >= nextCountry.min && len <= nextCountry.max;
    onChange({ e164: digits ? `+${nextCountry.dial}${digits}` : "", valid: ok });
  }

  function firstTouch() {
    if (!touched) {
      setTouched(true);
      onFirstTouch?.();
    }
  }

  function pickCountry(c: Country) {
    setCountry(c);
    setOpen(false);
    emit(c, national);
  }

  function onNationalChange(v: string) {
    // keep digits + spaces for readability; strip on emit
    const cleaned = v.replace(/[^\d\s]/g, "");
    setNational(cleaned);
    emit(country, cleaned);
  }

  return (
    <div className="relative">
      <div className="flex items-stretch gap-2">
        {/* Country selector */}
        <button
          type="button"
          onClick={() => {
            firstTouch();
            setOpen((o) => !o);
          }}
          aria-label="اختر الدولة"
          aria-expanded={open}
          className="flex h-12 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-semibold"
        >
          <span className="text-base">{country.flag}</span>
          <span dir="ltr">+{country.dial}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* National number */}
        <div className="relative flex-1">
          <input
            id={id}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            dir="ltr"
            value={national}
            onFocus={firstTouch}
            onChange={(e) => onNationalChange(e.target.value)}
            placeholder="5X XXX XXXX"
            aria-invalid={touched && national.length > 0 && !valid}
            className="h-12 w-full rounded-md border border-input bg-background px-3 pe-10 text-right text-base outline-none focus:ring-2 focus:ring-primary/40"
          />
          {valid && (
            <Check className="pointer-events-none absolute inset-y-0 end-3 my-auto h-5 w-5 text-emerald-500" />
          )}
        </div>
      </div>

      {/* Country dropdown */}
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
            tabIndex={-1}
          />
          <ul
            role="listbox"
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg"
          >
            {COUNTRIES.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.code === country.code}
                  onClick={() => pickCountry(c)}
                  className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-sm hover:bg-accent ${
                    c.code === country.code ? "bg-accent/60 font-semibold" : ""
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 text-start">{c.name}</span>
                  <span dir="ltr" className="text-muted-foreground">
                    +{c.dial}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
