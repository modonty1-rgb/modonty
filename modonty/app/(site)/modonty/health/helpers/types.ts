/** A health facility from one of the two official lists. */
export interface Facility {
  name: string;
  /** The English name — CHI's lists carry one. */
  nameEn?: string;
  type: string;
  region: string;
  city: string;
  source: "cbahi" | "chi";
  /** سباهي only: its accreditation status in Arabic, and the date it runs to. */
  status?: string;
  until?: string;
}

/** A drug registered with هيئة الغذاء والدواء, as its open-data list gives it. */
export interface Drug {
  trade: string;
  scientific: string;
  /** How it is dispensed: over the counter, or on a prescription. */
  dispensing: "otc" | "prescription" | "other";
  manufacturer: string;
  country: string;
}
