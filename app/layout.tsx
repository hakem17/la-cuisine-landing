import { AnalyticsListener } from "@/components/analytics-listener";
import { ContactWidget } from "@/components/contact-widget";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GTM_ID = "GTM-T44TZBQW";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  // serif is only ever used for italic accents (em, quotes)
  style: ["italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "La Cuisine de Manou — Seasonal Catering for Memorable Tables",
  description:
    "Private chef and premium seasonal catering in Abu Dhabi, Dubai and the UAE. Thoughtful menus for intimate dinners, corporate gatherings and special occasions.",
  generator: "v0.app",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4f0e8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`bg-background ${dmSans.variable} ${playfair.variable}`}
    >
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) inject
          attributes on <body> before hydration; this only silences that one
          element's attribute diff, not mismatches in its children. */}
      <body className={`${dmSans.className} antialiased`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        {/* This is the noscript version of the Google Tag Manager. It will be used if JavaScript is disabled. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Website content */}
        <>
          {children}
          <ContactWidget />
          <AnalyticsListener />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </>

        {/* Google Tag Manager */}
        {/* Loaded once the browser is idle so it doesn't compete with the hero for bandwidth/CPU. */}
        <Script id="gtm" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </body>
    </html>
  );
}
