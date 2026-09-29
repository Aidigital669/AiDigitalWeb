import { Inter, Sora } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import ChatWidget from "./components/ChatWidget";
import WhatsAppFloating from "./components/WhatsAppFloating";
import BackToTop from "./components/BackToTop";
import GlobalCursorGlow from "./components/GlobalCursorGlow";
import VisitorTracker from "./components/VisitorTracker";
import { VisibilityProvider } from "./context/VisibilityContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["600", "700"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://www.aidigital.biz"),
  title: "AI Digital | Neural Growth Marketing",
  description:
    "AI-powered digital marketing for SEO, performance campaigns, social growth, design, and analytics.",
  keywords: [
    "AI Digital",
    "Neural Growth Marketing",
    "Digital Marketing Agency",
    "SEO Services",
    "Performance Marketing",
    "AI Social Growth",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Digital | Neural Growth Marketing",
    description:
      "AI-powered digital marketing for SEO, performance campaigns, social growth, design, and analytics.",
    url: "https://www.aidigital.biz",
    siteName: "AI Digital",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.aidigital.biz/Logo.ai.png",
        width: 800,
        height: 600,
        alt: "AI Digital Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Digital | Neural Growth Marketing",
    description:
      "AI-powered digital marketing for SEO, performance campaigns, social growth, design, and analytics.",
    images: ["https://www.aidigital.biz/Logo.ai.png"],
  },
  verification: {
    google: "google8aec74b2f55ad942",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        <link rel="icon" href="/Logo.ai.png" type="image/png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AI Digital",
              url: "https://www.aidigital.biz",
              logo: "https://www.aidigital.biz/Logo.ai.png",
              description:
                "AI-powered digital marketing for SEO, performance campaigns, social growth, design, and analytics.",
            }),
          }}
        />
        {gtmId && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
        )}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '975563025122146');
              fbq('track', 'PageView');
            `,
          }}
        />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-P9EYEHJMHY"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-P9EYEHJMHY');
            `,
          }}
        />
      </head>
      <body>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=975563025122146&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <VisibilityProvider>
          <GlobalCursorGlow />
          <Suspense fallback={null}>
            <VisitorTracker />
          </Suspense>
          {children}
          <ChatWidget />
          <WhatsAppFloating />
          <BackToTop />
        </VisibilityProvider>
      </body>
    </html>
  );
}

