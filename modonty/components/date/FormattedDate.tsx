"use client";

import { useState, useEffect } from "react";

interface FormattedDateProps {
  date: Date | string;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export function FormattedDate({
  date,
  locale = "ar-SA",
  options = defaultOptions,
}: FormattedDateProps) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    const d = typeof date === "string" ? new Date(date) : date;
    setFormatted(d.toLocaleDateString(locale, options));
  }, [date, locale, options]);

  return <span suppressHydrationWarning>{formatted || "\u00A0"}</span>;
}
