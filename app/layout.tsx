import "./globals.css";
import type { Metadata } from "next";
import { Header } from "~/components/header";
import { Assistant, Bebas_Neue } from "next/font/google";
import { cn } from "~/lib/utils";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});
const assistant = Assistant({ subsets: ["latin"], variable: "--font-base" });

export const metadata: Metadata = {
  title:
    "Surviving Storms | Making Life Amidst the Environmental Crises of Man",
  description: "Mapping Hurricane Hazards, Survivals, and Repair in Dominica",
  openGraph: {
    type: "website",
    title: "Surviving Storms",
    description: "Making Life Amidst the Environmental Crises of Man",
    images: "https://survivingstorms.notprimitive.com/og-image.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "bg-gray-100 text-gray-800 selection:bg-blue-800/75 selection:text-gray-50",
          assistant.variable,
          bebasNeue.variable,
        )}
      >
        <Header />

        {children}
      </body>
    </html>
  );
}
