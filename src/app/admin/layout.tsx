import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cairo, Scheherazade_New } from "next/font/google";
import { ThemeScript } from "@/components/ThemeScript";
import "../globals.css";

// The admin is the shop's private back office (Arabic, right-to-left). Owner request:
// same look as the shop: same fonts, same colors, and the same morning / evening switch
// (the choice is shared with the site, it is saved under the same name).
const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const cairo = Cairo({ variable: "--font-cairo", subsets: ["latin"], display: "swap", preload: false });
const bodoni = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "الإدارة | Elsanour", template: "%s | إدارة Elsanour" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06140f" },
    { media: "(prefers-color-scheme: light)", color: "#f8f6f1" },
  ],
};

// Admin pages depend on the login: they are allowed to wait for the server.
export const instant = false;

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${scheherazade.variable} ${cairo.variable} ${bodoni.variable} h-full antialiased`}
      // data-theme is set by the theme script (ThemeScript) before React loads
      suppressHydrationWarning
    >
      <body className="min-h-full bg-noir-950 font-sans text-ivory">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
