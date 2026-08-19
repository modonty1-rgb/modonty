/**
 * Rows per chunk of the archive — one number, three readers: the page (to know when a page number
 * is past the end), the feed (to slice), and the endpoint (to answer the scroll).
 *
 * Twenty, not the homepage feed's ten: a mini row is roughly a quarter the height of the homepage
 * card, and ten of them left the column half empty (Khalid, 2026-08-19: «مساحات كبيرة فاضية»).
 * Kept here because the same number written in three files is a number that drifts.
 */
export const ARCHIVE_PAGE_SIZE = 20;
