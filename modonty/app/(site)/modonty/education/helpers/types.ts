/** A date on the ministry's school calendar. `staff` dates are for teachers and administrators. */
export interface CalendarEvent {
  /** ISO date (Gregorian), as the ministry lists it. */
  date: string;
  /** DD/MM/YYYY on the Umm al-Qura calendar, as the ministry lists it. */
  hijri: string;
  name: string;
  kind: "start" | "holiday" | "staff";
  /** An Eid holiday — the ministry notes it may move a day with the moon sighting. */
  moon?: boolean;
}

export type SchoolGender = "M" | "F";

/** One test result of a school: the test, its track, the school year, the average and the national rank. */
export interface SchoolResult {
  test: string;
  track: string;
  year: number;
  average: number;
  rank: number;
  /** How many schools were ranked in the same year, test, track and gender. */
  outOf: number;
  /** The same school, test and track the year before — absent when it was not ranked then. */
  previousRank: number | null;
}

export interface SchoolMatch {
  name: string;
  region: string;
  gender: SchoolGender;
  results: SchoolResult[];
}

export type AccreditationStatus = "full" | "conditional" | "pending" | "rejected" | "expired" | "none";

export interface ProgramMatch {
  institution: string;
  campus: string;
  city: string;
  degree: string;
  program: string;
  status: AccreditationStatus;
  year: number;
}
