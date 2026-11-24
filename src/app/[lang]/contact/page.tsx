import type { Metadata } from "next";
import { FacebookIcon, InstagramIcon } from "@/components/icons";
import { InfoPage } from "@/components/InfoPage";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getStorePhone } from "@/lib/settings";
import { FACEBOOK_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  const t = dict.pages.contact;
  return pageMetadata({ locale, path: "/contact", title: `${t.title} | Elsanour`, description: t.description });
}

// Contact: Instagram, Facebook, and WhatsApp when the owner has set the shop number in /admin/settings.
export default async function ContactPage() {
  const { dict } = await getDictionary();
  const t = dict.pages.contact;
  const phone = await getStorePhone();

  return (
    <InfoPage title={t.title} intro={t.intro}>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="gem gem-dark w-full">
          <span className="gem-face text-base">
            <InstagramIcon className="size-5" />
            {t.instagram}
          </span>
        </a>
        {phone && (
          <a
            href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(t.whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gem w-full"
          >
            <span className="gem-face text-base">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor">
                <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2zm0 17.9a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.6 4.1 3.6 1.5.7 2.1.7 2.9.6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3z" />
              </svg>
              {t.whatsapp}
            </span>
          </a>
        )}
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`gem gem-dark w-full ${phone ? "sm:col-span-2" : ""}`}
        >
          <span className="gem-face text-base">
            <FacebookIcon className="size-5" />
            {t.facebook}
          </span>
        </a>
      </div>
      <p className="mt-2 text-center text-sm text-muted" dir="ltr">
        {INSTAGRAM_HANDLE} · facebook.com/elsanour
      </p>
      <p className="border border-gold-400/15 bg-noir-800 px-5 py-4 text-center text-sm leading-7 text-ivory/85">{t.orderTip}</p>
    </InfoPage>
  );
}
