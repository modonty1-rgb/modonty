"use server";

export async function getAuthors() {
  try {
    const { getModontyAuthor } = await import("@/lib/authors/get-modonty-author");
    const modontyAuthor = await getModontyAuthor();
    return modontyAuthor ? [{ id: modontyAuthor.id, name: modontyAuthor.name }] : [];
  } catch (error) {
    console.error("Error fetching authors:", error);
    return [];
  }
}

