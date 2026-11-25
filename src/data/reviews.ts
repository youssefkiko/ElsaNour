/**
 * Customer reviews shown in the moving strip on the home page (components/home/Reviews.tsx).
 *
 * ONLY REAL REVIEWS from real customers (WhatsApp, Instagram or phone messages the owner
 * received), copied word for word, with the customer's first name and city only (no surname,
 * no phone number). Never invent or "improve" a review: fake reviews break the customers'
 * trust and are forbidden by consumer law.
 *
 * The strip stays hidden until there are at least 3 reviews.
 */
export type Review = {
  /** First name only, e.g. "سلمى". */
  name: string;
  /** City, e.g. "الدار البيضاء". */
  city: string;
  /** The customer's own words. */
  text: string;
  /** What she ordered (optional), e.g. "طقم القلب اللامع". */
  product?: string;
  /** Stars out of 5 when the customer gave a rating (optional). */
  rating?: number;
};

export const REVIEWS: Review[] = [];
