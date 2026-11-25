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
  /** City, only when the customer said it (optional). */
  city?: string;
  /** The customer's own words. */
  text: string;
  /** What she ordered (optional), e.g. "طقم القلب اللامع". */
  product?: string;
  /** Stars out of 5, only when the customer gave a rating herself (optional). */
  rating?: number;
  /** Where the message came from, e.g. "Instagram". */
  source?: string;
  /**
   * Screenshot of the conversation in public/reviews/ (owner choice: shown instead of the text).
   * Cropped to the messages only: no profile photo, account name, phone number or address.
   */
  image?: string;
};

// Real messages from customers on Instagram (screenshots sent by the owner, 2026-11-26).
// The text is copied word for word (separate messages joined with " … ") and used as the
// screenshot's description for screen readers and search engines.
export const REVIEWS: Review[] = [
  { name: "Assia", text: "J'ai reçu la commande wsalni bhal li cheft f la video. Merci bcp", source: "Instagram", image: "/reviews/assia.webp" },
  { name: "Oumaima", text: "Chokrraaaan bzfff … Wlah ela moeamala w hit wesitihom yjiboha bekrii, W colie fniiwen ejbni bzf", source: "Instagram", image: "/reviews/oumaima.webp" },
  { name: "Youssef", text: "Command zwinaaa ou hta mn qualite n9iya ou zwina", source: "Instagram", image: "/reviews/youssef-2.webp" },
  { name: "Arij", text: "Theliti fina hhhh … Hadchi zwin xukrann 😍😍", source: "Instagram", image: "/reviews/arij.webp" },
  { name: "Mohamed", text: "Aah wslat chukran bzf … Slm khty cammand zwena chukran", source: "Instagram", image: "/reviews/mohamed.webp" },
  { name: "Youssef", text: "Akhoya 3jbatni llah ihfdakk … Tahya frhana 🙂 … Wa3r", source: "Instagram", image: "/reviews/youssef-1.webp" },
  { name: "G.", text: "Wslatni chokran zwina bzafff", source: "Instagram", image: "/reviews/g.webp" },
];
