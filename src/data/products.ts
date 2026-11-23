import type { Locale } from "@/i18n/config";
import type { Category } from "@/lib/categories";

/**
 * Product catalog (Phase 2: static placeholder data).
 * Names, prices and contents are PLACEHOLDERS until the owner sends the real ones.
 * In Phase 5 this moves to the database and the owner edits it from the admin.
 */

export type ItemKey =
  | "necklace"
  | "pearlNecklace"
  | "earrings"
  | "pearlEarrings"
  | "hoops"
  | "ring"
  | "bracelet"
  | "pearlBracelet"
  | "watch"
  | "giftBox";

export type Product = {
  slug: string;
  category: Category;
  name: Record<Locale, string>;
  /** Price in MAD. */
  price: number;
  /** Old price in MAD, shown crossed out (optional). */
  compareAt?: number;
  /** Photos in /public/products, in order. Empty = clean placeholder slides. */
  images: string[];
  /** What is inside the gift box (names in the dictionaries: product.items). */
  includes: ItemKey[];
  inStock: boolean;
  isActive: boolean;
  sortOrder: number;
};

const n = (ar: string, fr: string, en: string): Record<Locale, string> => ({ ar, fr, en });

export const products: Product[] = [
  // Necklaces
  { slug: "nour-necklace", category: "necklaces", name: n("قلادة نور", "Collier Nour", "Nour Necklace"), price: 189, compareAt: 229, images: [], includes: ["necklace", "giftBox"], inStock: true, isActive: true, sortOrder: 1 },
  { slug: "pearl-necklace", category: "necklaces", name: n("قلادة اللؤلؤ", "Collier Perle", "Pearl Necklace"), price: 219, images: [], includes: ["pearlNecklace", "giftBox"], inStock: true, isActive: true, sortOrder: 2 },
  { slug: "moon-necklace", category: "necklaces", name: n("قلادة القمر", "Collier Lune", "Moon Necklace"), price: 199, images: [], includes: ["necklace", "giftBox"], inStock: true, isActive: true, sortOrder: 3 },

  // Earrings
  { slug: "star-earrings", category: "earrings", name: n("أقراط النجمة", "Boucles Étoile", "Star Earrings"), price: 149, images: [], includes: ["earrings", "giftBox"], inStock: true, isActive: true, sortOrder: 1 },
  { slug: "pearl-earrings", category: "earrings", name: n("أقراط اللؤلؤ", "Boucles Perle", "Pearl Earrings"), price: 159, compareAt: 199, images: [], includes: ["pearlEarrings", "giftBox"], inStock: true, isActive: true, sortOrder: 2 },
  { slug: "golden-hoops", category: "earrings", name: n("أقراط الحلقة الذهبية", "Créoles Dorées", "Golden Hoops"), price: 139, images: [], includes: ["hoops", "giftBox"], inStock: true, isActive: true, sortOrder: 3 },

  // Rings
  { slug: "diamond-ring", category: "rings", name: n("خاتم الألماسة", "Bague Diamant", "Diamond Ring"), price: 179, images: [], includes: ["ring", "giftBox"], inStock: true, isActive: true, sortOrder: 1 },
  { slug: "crown-ring", category: "rings", name: n("خاتم التاج", "Bague Couronne", "Crown Ring"), price: 169, compareAt: 209, images: [], includes: ["ring", "giftBox"], inStock: true, isActive: true, sortOrder: 2 },
  { slug: "emerald-ring", category: "rings", name: n("خاتم الزمرد", "Bague Émeraude", "Emerald Ring"), price: 189, images: [], includes: ["ring", "giftBox"], inStock: true, isActive: true, sortOrder: 3 },

  // Bracelets
  { slug: "fine-bracelet", category: "bracelets", name: n("سوار رفيع", "Bracelet Fin", "Fine Bracelet"), price: 129, images: [], includes: ["bracelet", "giftBox"], inStock: true, isActive: true, sortOrder: 1 },
  { slug: "pearl-bracelet", category: "bracelets", name: n("سوار اللؤلؤ", "Bracelet Perle", "Pearl Bracelet"), price: 149, images: [], includes: ["pearlBracelet", "giftBox"], inStock: true, isActive: true, sortOrder: 2 },
  { slug: "stars-bracelet", category: "bracelets", name: n("سوار النجوم", "Bracelet Étoiles", "Stars Bracelet"), price: 139, compareAt: 179, images: [], includes: ["bracelet", "giftBox"], inStock: true, isActive: true, sortOrder: 3 },

  // Watches
  { slug: "queen-watch", category: "watches", name: n("ساعة الملكة", "Montre Reine", "Queen Watch"), price: 299, compareAt: 349, images: [], includes: ["watch", "giftBox"], inStock: true, isActive: true, sortOrder: 1 },
  { slug: "emerald-watch", category: "watches", name: n("ساعة الزمرد", "Montre Émeraude", "Emerald Watch"), price: 279, images: [], includes: ["watch", "giftBox"], inStock: true, isActive: true, sortOrder: 2 },
  { slug: "classic-gold-watch", category: "watches", name: n("ساعة ذهبية كلاسيك", "Montre Dorée Classique", "Classic Gold Watch"), price: 259, images: [], includes: ["watch", "giftBox"], inStock: false, isActive: true, sortOrder: 3 },

  // Gift packs
  { slug: "princess-pack", category: "packs", name: n("باقة الأميرة", "Coffret Princesse", "Princess Pack"), price: 249, images: [], includes: ["necklace", "earrings", "bracelet", "giftBox"], inStock: true, isActive: true, sortOrder: 1 },
  { slug: "queen-pack", category: "packs", name: n("باقة الملكة", "Coffret Reine", "Queen Pack"), price: 349, compareAt: 399, images: [], includes: ["watch", "necklace", "earrings", "bracelet", "giftBox"], inStock: true, isActive: true, sortOrder: 2 },
  { slug: "pearl-pack", category: "packs", name: n("باقة اللؤلؤ", "Coffret Perle", "Pearl Pack"), price: 279, images: [], includes: ["pearlNecklace", "pearlEarrings", "pearlBracelet", "giftBox"], inStock: true, isActive: true, sortOrder: 3 },
];

export const activeProducts = () => products.filter((p) => p.isActive);

export const productsInCategory = (category: Category) =>
  activeProducts()
    .filter((p) => p.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);

export const getProduct = (slug: string) => activeProducts().find((p) => p.slug === slug);

export const productHref = (locale: string, slug: string) => `/${locale}/product/${slug}`;

/** Discount in % when there is an old price, e.g. 18 for 189 instead of 229. */
export const discountPercent = (p: Product) =>
  p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
