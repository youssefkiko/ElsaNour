import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cairo, Cormorant, El_Messiri } from "next/font/google";
import { notFound } from "next/navigation";
import { getDirection, hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeScript } from "@/components/ThemeScript";
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

// Headings (recommended by ui-ux-pro-max for luxury jewelry):
// El Messiri for Arabic, Cormorant for French and English. Body text stays Cairo.
const messiri = El_Messiri({
  variable: "--font-messiri",
  subsets: ["arabic", "latin"],
  weight: ["600", "700"],
  display: "swap",
});
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: false, // Arabic is the default language; French/English headings load on demand
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06140f" },
    { media: "(prefers-color-scheme: light)", color: "#f8f6f1" },
  ],
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
      className={`${cairo.variable} ${bodoni.variable} ${messiri.variable} ${cormorant.variable} h-full scroll-pt-20 scroll-smooth antialiased`}
      // data-theme is set by the theme script (ThemeScript) before React loads
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeScript />
        <SiteHeader locale={lang} dict={dict} />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter locale={lang} dict={dict} />
      </body>
    </html>
  );
}
