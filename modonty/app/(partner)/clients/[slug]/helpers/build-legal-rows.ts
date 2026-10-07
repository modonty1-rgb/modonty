export interface AboutLegal {
  legalName?: string | null;
  commercialRegistrationNumber?: string | null;
  legalForm?: string | null;
  vatID?: string | null;
  numberOfEmployees?: string | null;
  foundingDate?: Date | null;
  knowsLanguage?: string[];
}

/** The official legal data rows of «عن الشركة» — only the fields the partner filled in. */
export function buildLegalRows(legal: AboutLegal): Array<{ icon: string; label: string; value: string }> {
  const foundingYear =
    legal.foundingDate != null ? String(new Date(legal.foundingDate).getFullYear()) : null;
  const languages =
    legal.knowsLanguage && legal.knowsLanguage.length > 0 ? legal.knowsLanguage.join("، ") : null;

  return [
    legal.legalName ? { icon: "🏛️", label: "الاسم القانوني", value: legal.legalName } : null,
    legal.commercialRegistrationNumber
      ? { icon: "📄", label: "السجل التجاري", value: legal.commercialRegistrationNumber }
      : null,
    legal.legalForm ? { icon: "⚖️", label: "الشكل القانوني", value: legal.legalForm } : null,
    legal.vatID ? { icon: "🧾", label: "الرقم الضريبي", value: legal.vatID } : null,
    legal.numberOfEmployees
      ? { icon: "👥", label: "حجم الشركة", value: legal.numberOfEmployees }
      : null,
    foundingYear ? { icon: "🗓️", label: "سنة التأسيس", value: foundingYear } : null,
    languages ? { icon: "🌐", label: "اللغات", value: languages } : null,
  ].filter((row): row is { icon: string; label: string; value: string } => row !== null);
}
