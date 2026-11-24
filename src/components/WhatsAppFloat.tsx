"use client";

import { usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  /** Shop WhatsApp number (+2126...), from /admin/settings. No number = no button. */
  phone: string | null;
  t: Dictionary["whatsapp"];
};

/**
 * Small floating WhatsApp button ("Ask us"), on the opposite side of the golden basket.
 * On a product page the message already contains the product name and its link,
 * so the owner knows right away what the question is about.
 */
export function WhatsAppFloat({ phone, t }: Props) {
  const pathname = usePathname() ?? "";
  if (!phone || /\/checkout(\/|$)/.test(pathname)) return null;

  const open = () => {
    const isProduct = /\/product\//.test(pathname);
    const name = document.title.replace(/\s*\|\s*Elsanour\s*$/, "").trim();
    const text = isProduct ? `${t.aboutProduct}\n${name}\n${window.location.href}` : t.general;
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <button
      type="button"
      onClick={open}
      aria-label={t.label}
      title={t.label}
      className="wa-float fixed start-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/30 ring-2 ring-white/20 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-gold-300 focus-visible:outline-none active:scale-95"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-8" fill="currentColor">
        <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2zm0 17.9a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3z" />
      </svg>
    </button>
  );
}
