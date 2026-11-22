import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import { getDirection, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "../globals.css";

// Main text font: supports Arabic and Latin (French, English).
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

// High-contrast luxury serif for the "Elsanour" wordmark (fashion / jewelry style).
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export const viewport: Viewport = {
  themeColor: "#070707",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { dict } = await getDictionary();

  return (
    <html
      lang={lang}
      dir={getDirection(lang)}
      data-scroll-behavior="smooth"
      className={`${cairo.variable} ${bodoni.variable} h-full scroll-pt-20 scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader locale={lang} dict={dict} />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter locale={lang} dict={dict} />
      </body>
    </html>
  );
}
