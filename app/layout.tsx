import { ContactWidget } from "@/components/contact-widget";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GTM_ID = "GTM-MDS6SP4G";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
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
      <body className={`${dmSans.className} antialiased`}>
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
          {process.env.NODE_ENV === "production" && <Analytics />}
        </>

        {/* Google Tag Manager */}
        {/* This is the main Google Tag Manager script. It will be executed after the page loads. */}
        <Script id="gtm" strategy="afterInteractive">
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
