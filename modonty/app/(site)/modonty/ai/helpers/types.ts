/** A line machine-translated into Arabic, and the language it came from («en», «zh-CN») — Google
 *  requires the text be marked `lang="ar-x-mtfrom-<from>"` on an indexed page. */
export interface Brief {
  text: string;
  from: string;
}

/** A model on the Hugging Face Hub, as the page lists it. */
export interface AiModel {
  /** «Qwen/Qwen-Image-2.1» — the Hub's id, also its address. */
  id: string;
  author: string;
  name: string;
  /** The Hub's `pipeline_tag` («text-generation»), shown in Arabic. */
  task: string | null;
  likes: number;
  url: string;
  /** One Arabic line from the model's own card, translated — null when the card says nothing usable. */
  brief: Brief | null;
}

/** A paper on arXiv: its metadata only, the text stays on arXiv (its API terms). */
export interface Paper {
  id: string;
  title: string;
  /** ISO date of the first version. */
  published: string;
  authors: string[];
  url: string;
  /** The abstract's opening, in Arabic. */
  brief: Brief | null;
}

/** A public GitHub repository. */
export interface Repo {
  name: string;
  /** Null when the owner wrote none, or wrote it in a script our readers would not read. */
  description: string | null;
  stars: number;
  url: string;
  /** The owner's description in Arabic — whatever language it was written in. */
  brief: Brief | null;
}
