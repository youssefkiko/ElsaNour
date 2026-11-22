// Shop categories (collections). The names are in the dictionaries (collections.items).
export const categories = ["necklaces", "earrings", "rings", "bracelets", "watches", "packs"] as const;
export type Category = (typeof categories)[number];

export const isCategory = (value: string): value is Category =>
  (categories as readonly string[]).includes(value);

export const categoryHref = (locale: string, category: Category) => `/${locale}/category/${category}`;
