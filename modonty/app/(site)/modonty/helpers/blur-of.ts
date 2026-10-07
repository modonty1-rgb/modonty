/** `next/image`'s blur props for an image that has a placeholder, nothing for one that has not. */
export const blurOf = (img: { blur: string | null }) => (img.blur ? { placeholder: "blur" as const, blurDataURL: img.blur } : {});
