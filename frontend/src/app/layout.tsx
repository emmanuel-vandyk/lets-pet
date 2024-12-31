import type { Metadata } from "next";
import { Baloo_2 as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";


const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lets Pet",
  description: "Developed by Lets Pet",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body
        className={cn(
          "grid max-h-screen min-w-min grid-rows-layout font-sans text-fondodark",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
