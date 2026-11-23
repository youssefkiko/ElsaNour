import type { Dictionary } from "@/i18n/dictionaries";
import { CashIcon, GiftIcon, TruckIcon } from "../icons";

/** Three small reassurances under the main button: cash on delivery, delivery, gift box. */
export function TrustRow({ t }: { t: Dictionary["basket"] }) {
  const items = [
    { Icon: CashIcon, text: t.trustCod },
    { Icon: TruckIcon, text: t.trustDelivery },
    { Icon: GiftIcon, text: t.trustGift },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2 text-center">
      {items.map(({ Icon, text }) => (
        <li key={text} className="flex flex-col items-center gap-1.5 text-[11px] leading-4 text-muted">
          <Icon className="size-5 text-gold-400" />
          {text}
        </li>
      ))}
    </ul>
  );
}
