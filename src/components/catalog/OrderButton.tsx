import { AddToBasketButton } from "../cart/AddToBasketButton";

type Props = {
  slug: string;
  inStock: boolean;
  labels: { add: string; added: string; max: string; full: string; outOfStock: string };
  /** Price text shown next to the button in the sticky bar on phones. */
  priceText: string;
};

/**
 * "Add to basket" on the product page, a 3D emerald gem.
 * Out of stock: a sunken gem that cannot be pressed.
 * On phones the button is also repeated in a bar fixed at the bottom of the screen
 * (the golden basket then floats just above that bar, see .sticky-buy-bar in globals.css).
 */
export function OrderButton({ slug, inStock, labels, priceText }: Props) {
  return (
    <>
      {/* In the page (all screens) */}
      <div className="mt-6">
        <AddToBasketButton slug={slug} inStock={inStock} labels={labels} className="w-full sm:w-auto sm:min-w-64" />
      </div>

      {/* Sticky bar at the bottom on phones */}
      <div className="sticky-buy-bar fixed inset-x-0 bottom-0 z-30 border-t border-gold-400/20 bg-noir-950/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <span className="text-lg font-bold text-gold-300">{priceText}</span>
          <AddToBasketButton slug={slug} inStock={inStock} labels={labels} className="flex-1" />
        </div>
      </div>
    </>
  );
}
