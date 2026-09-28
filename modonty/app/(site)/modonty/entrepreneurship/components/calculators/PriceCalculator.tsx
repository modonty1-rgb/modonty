"use client";

import { useState } from "react";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

import { NumberField } from "./NumberField";

export interface PriceCalculatorLabels {
  title: string;
  cost: string;
  margin: string;
  beforeVat: string;
  vat: string;
  final: string;
  profit: string;
}

/** The standard VAT rate — ZATCA's guidelines: «a 15% VAT charge … is assessed and added to the sales price». */
const VAT_RATE = 0.15;
const MONEY = new Intl.NumberFormat(SITE_LOCALE, { maximumFractionDigits: 2 });

/** From what an item costs the seller and the margin they want, to the price the customer pays. */
export function PriceCalculator({ labels: t, currency }: { labels: PriceCalculatorLabels; currency: string }) {
  const [cost, setCost] = useState("");
  const [margin, setMargin] = useState("");
  const c = Number(cost);
  const m = Number(margin);
  const ready = cost !== "" && margin !== "" && c >= 0 && m >= 0;
  const before = c * (1 + m / 100);
  const vat = before * VAT_RATE;

  return (
    <div className="rounded-lg bg-muted/40 p-4">
      <h3 className="text-sm font-bold">{t.title}</h3>
      <div className="mt-3 space-y-3">
        <NumberField id="price-cost" label={t.cost} unit={currency} value={cost} onChange={setCost} />
        <NumberField id="price-margin" label={t.margin} value={margin} onChange={setMargin} />
      </div>
      {ready && (
        <dl className="mt-4 space-y-1.5 text-sm">
          <Row label={t.beforeVat} value={`${MONEY.format(before)} ${currency}`} />
          <Row label={t.vat} value={`${MONEY.format(vat)} ${currency}`} />
          <Row label={t.final} value={`${MONEY.format(before + vat)} ${currency}`} strong />
          <Row label={t.profit} value={`${MONEY.format(before - c)} ${currency}`} />
        </dl>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`tabular-nums ${strong ? "text-base font-bold text-foreground" : "font-semibold"}`}>{value}</dd>
    </div>
  );
}
