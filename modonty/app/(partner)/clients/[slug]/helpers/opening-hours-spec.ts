/** One schema.org OpeningHoursSpecification row as the partner page reads it. */
export interface OpeningHoursSpec {
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}
