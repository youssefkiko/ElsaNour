import type { ComponentType } from "react";
import type { Category } from "@/lib/categories";
import { BraceletIcon, EarringIcon, GiftIcon, NecklaceIcon, RingIcon, WatchIcon } from "./icons";

/** One line icon per category (used on tiles, category pages and photo placeholders). */
export const categoryIcons: Record<Category, ComponentType<{ className?: string }>> = {
  necklaces: NecklaceIcon,
  earrings: EarringIcon,
  rings: RingIcon,
  bracelets: BraceletIcon,
  watches: WatchIcon,
  packs: GiftIcon,
};
