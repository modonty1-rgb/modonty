export const buildPageHref = (targetPage: number) => (targetPage > 1 ? `/industries?page=${targetPage}` : "/industries");
