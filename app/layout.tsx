import type { Metadata } from "next";
import { Oswald, Source_Serif_4 } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SpaceBackground } from "@/components/SpaceBackground";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NICK.ODE",
  description: "Portfolio of NICK.ODE.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme is set by the inline script before hydration, so React
    // would otherwise warn about the attribute mismatch.
    <html
      lang="en"
      className={`${oswald.variable} ${sourceSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body id="top">
        <SpaceBackground />
        <Nav />
        <main className="pt-[var(--nav-h)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
