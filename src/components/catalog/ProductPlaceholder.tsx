import type { Category } from "@/lib/categories";
import { categoryIcons } from "../home/Collections";

type Props = {
  category: Category;
  /** Slide number: changes the light angle so each placeholder slide looks different. */
  index?: number;
  label: string;
  className?: string;
};

const angles = ["50%_35%", "30%_40%", "70%_45%", "50%_60%"];

/** Clean placeholder used until the real product photos are added in /public/products. */
export function ProductPlaceholder({ category, index = 0, label, className = "" }: Props) {
  const Icon = categoryIcons[category];
  const at = angles[index % angles.length];
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-gold-400/70 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at ${at.replace("_", " ")}, var(--c-noir-600), var(--c-noir-800) 72%)`,
      }}
    >
      <Icon className="size-12 sm:size-16" />
      <span className="text-sm text-gold-200/60">{label}</span>
    </div>
  );
}
