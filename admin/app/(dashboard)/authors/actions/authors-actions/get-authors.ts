"use server";

import { getModontyAuthor } from "./get-modonty-author";

export async function getAuthors() {
  try {
    const modontyAuthor = await getModontyAuthor();
    if (!modontyAuthor) {
      return [];
    }

    return [modontyAuthor];
  } catch (error) {
    console.error("Error fetching authors:", error);
    return [];
  }
}

