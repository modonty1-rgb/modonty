/** The shape of `public/help/audio/general-pitch/manifest.json`, as the story player reads it. */
export interface ManifestSection {
  id: string;
  label: string;
  text: string;
  wordCount: number;
  highlight?: string | string[];
  optional?: boolean;
  chipEmoji?: string;
  file?: string;
  sizeKB?: number;
  media?: "logo-spotlight" | "vision-2030" | "team" | "testimonial" | "partners";
}

export interface ManifestCategory {
  label: string;
  emoji?: string;
  sectionIds: string[];
}

export interface Manifest {
  voice: string;
  categories?: ManifestCategory[];
  sections: ManifestSection[];
}
