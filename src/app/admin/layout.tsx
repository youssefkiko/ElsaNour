import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cairo, El_Messiri } from "next/font/google";
import "../globals.css";

// The admin is the shop's private back office: Arabic, right-to-left, evening (dark) theme.
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], display: "swap" });
const bodoni = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"], display: "swap" });
const messiri = El_Messiri({
  variable: "--font-messiri",
  subsets: ["arabic", "latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "الإدارة | Elsanour", template: "%s | إدارة Elsanour" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#06140f" };

// Admin pages depend on the login: they are allowed to wait for the server.
export const instant = false;

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="dark"
      className={`${cairo.variable} ${bodoni.variable} ${messiri.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-noir-950 font-sans text-ivory">{children}</body>
    </html>
  );
}
