import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Bebas_Neue,
  Pinyon_Script,
  Hanken_Grotesk,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import "./styles/k3-tokens.css";
import "./styles/k3-sections.css";
import "./styles/k3-pass3.css";
import "./styles/k3-pass4-material.css";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Atmosphere } from "@/components/site/atmosphere";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
  adjustFontFallback: false, // Bodoni Moda has no metric-override entry; skip the auto fallback
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const fontVars = [bodoni, bebas, pinyon, hanken, ibmPlexMono]
  .map((f) => f.variable)
  .join(" ");

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23161210'/%3E%3Crect x='1.5' y='1.5' width='29' height='29' rx='6' fill='none' stroke='%23C9A24B' stroke-width='1'/%3E%3Ctext x='16' y='23' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-size='20' fill='%23F4E7D6'%3EJ%3C/text%3E%3C/svg%3E";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Jawad Design — I serve websites",
  description:
    "I design and build portfolio sites and landing pages — beautiful, fast, and made to convert. A one-chef studio, made to order, shipped in five days.",
  icons: { icon: FAVICON },
  openGraph: {
    title: "Jawad Design — I serve websites",
    images: ["/brand/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body data-motion="on">
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Atmosphere />
        </ThemeProvider>
      </body>
    </html>
  );
}
