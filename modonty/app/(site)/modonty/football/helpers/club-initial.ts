/** First letter of the club, skipping the article: «الهلال» → «ه» · «أبها» → «أ». */
export const clubInitial = (name: string) => name.replace(/^ال/, "").trim().charAt(0) || "·";
