import type { Metadata } from "next";
import { Baloo_2 as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import Image from "next/image";
import iconHeader from "@/app/assets/letspet-png.png";
import { IconFacebook, IconInstagram, IconLinkedin } from "@/app/components/iconProvider";
import NavigationMenu from "./components/navigationMenu";
import ReactQueryProvider from "./ReactQueryProvider";


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
      <body className={cn(fontSans.variable, "w-full h-full font-sans text-body text-fondodark")}>
      <ReactQueryProvider>

        <div className="flex flex-col h-full bg-background">
          <header className='flex bg-default'>
            {/* Si la ruta es pública visualizar este Navbar */}
            <NavigationMenu />
            {/* Si la ruta es privada visualizar este Navbar */}
            {/* <NavigationMenuDashboard /> */}
          </header>
          <main className='w-full background-image bg-cover bg-center min-h-screen'>
            <div className="flex justify-evenly mx-auto px-4 py-8">
                {children}
            </div>
          </main>
          <footer className="background-footer w-full bg-secondary py-4 md:py-0 md:h-40 mt-auto">
            <div className="max-w-[1200px] mx-auto px-4 h-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
              <div className='flex items-center gap-4'>
                <Image
                  src={iconHeader}
                  alt="Lets Pet"
                  width={65}
                  height={65}
                />
                <h2 className="text-h2-bold z-10 text-fondodark whitespace-nowrap">Lets Pet!</h2>
              </div>
              <div className='flex flex-col justify-center items-center text-pretty'>
                <h2 className="text-h1-semibold text-fondodark">Lets Pet S.R.L</h2>
                <h3 className="text-fondodark text-body-bold">Calle Falsa 123</h3>
              </div>
              <div className='flex justify-end items-center'>
                <IconInstagram className='px-4 mr-3' />
                <IconFacebook className='px-4 mr-3' />
                <IconLinkedin className='px-3' />
              </div>
            </div>
          </footer>
        </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
