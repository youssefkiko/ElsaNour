/**
 * Shared look of the checkout fields: tall square-cornered field, icon at the start, and a label
 * that sits inside the field and floats up (smaller, gold) when the field is focused or
 * filled. Works with `placeholder=" "` on the input and the label placed AFTER it.
 */

/**
 * @param ltrInRtl a left-to-right input (phone number) on the Arabic page: its own
 * direction would flip the logical paddings, so the icon side is set physically.
 */
export const fieldInput = (invalid: boolean, multiline = false, ltrInRtl = false) =>
  [
    "peer block w-full rounded-none border bg-noir-800/70 text-base text-ivory",
    ltrInRtl ? "pr-12 pl-4 text-right" : "ps-12 pe-4",
    "transition-[border-color,box-shadow,background-color] duration-200 outline-none",
    "placeholder:text-transparent focus:bg-noir-800",
    multiline ? "min-h-28 resize-none pt-7 pb-3 leading-7" : "h-15 pt-5 pb-1",
    invalid
      ? "border-danger focus:border-danger focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--c-danger)_18%,transparent)]"
      : "border-ivory/10 hover:border-gold-400/35 focus:border-gold-300 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--c-gold-400)_16%,transparent)]",
  ].join(" ");

export const fieldLabel = (multiline = false) =>
  [
    "pointer-events-none absolute start-12 origin-[inline-start] text-[15px] text-muted transition-all duration-200",
    multiline ? "top-5" : "top-1/2 -translate-y-1/2",
    // Floated: when focused or filled.
    "peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-gold-300",
    "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold",
  ].join(" ");

export const fieldIcon = (multiline = false) =>
  [
    "pointer-events-none absolute start-4 size-5 text-gold-400/60 transition-colors duration-200 peer-focus:text-gold-300",
    multiline ? "top-5" : "top-1/2 -translate-y-1/2",
  ].join(" ");
