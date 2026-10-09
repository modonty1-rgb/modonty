"use client";

import { useState } from "react";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { fill } from "@/lib/i18n/fill";

import { NumberField } from "./NumberField";

export interface BreakEvenLabels {
  title: string;
  fixed: string;
  price: string;
  cost: string;
  units: string;
  perDay: string;
  loss: string;
}

const N = new Intl.NumberFormat(SITE_LOCALE);
const DAYS_IN_MONTH = 30;

/** How many items a month cover the fixed costs: fixed ÷ (price − cost per item), rounded up. */
export function BreakEvenCalculator({ labels: t, currency }: { labels: BreakEvenLabels; currency: string }) {
  const [fixed, setFixed] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const f = Number(fixed);
  const p = Number(price);
  const c = Number(cost);
  const ready = fixed !== "" && price !== "" && cost !== "" && f >= 0 && p >= 0 && c >= 0;
  const margin = p - c;
  const units = margin > 0 ? Math.ceil(f / margin) : 0;

  return (
    <div className="rounded-lg bg-muted/40 p-4">
      <h3 className="text-sm font-bold">{t.title}</h3>
      <div className="mt-3 space-y-3">
        <NumberField id="be-fixed" label={t.fixed} unit={currency} value={fixed} onChange={setFixed} />
        <NumberField id="be-price" label={t.price} unit={currency} value={price} onChange={setPrice} />
        <NumberField id="be-cost" label={t.cost} unit={currency} value={cost} onChange={setCost} />
      </div>
      {ready &&
        (margin > 0 ? (
          <div className="mt-4 text-sm">
            <p className="text-base font-bold">{fill(t.units, { n: N.format(units) })}</p>
            <p className="mt-0.5 text-muted-foreground">{fill(t.perDay, { n: N.format(Math.ceil(units / DAYS_IN_MONTH)) })}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm font-bold text-destructive">{t.loss}</p>
        ))}
    </div>
  );
}
