import type { Metadata } from "next";
import {
  Outfit,
  Bebas_Neue,
  Fira_Code,
  Caveat,
} from "next/font/google";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const fira = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Boopesh K — ECE • Embedded • IoT • Creative Technology",
  description:
    "Portfolio of Boopesh K — Electronics, Embedded Systems, IoT, PCB Design and Creative Technology.",
  verification: {
    google: "sqBvZDMyjKq8toTLbX5hrFjVvSjvR6uUKpIqwX-yOOY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${outfit.variable}
          ${bebas.variable}
          ${fira.variable}
          ${caveat.variable}
        `}
      >
        {children}
      </body>
    </html>
  );
}
