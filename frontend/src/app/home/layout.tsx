import React from 'react'
import Image from 'next/image';
import iconHeader from '@/app/assets/letspet-png.png';
import { IconFacebook, IconInstagram, IconLinkedin } from '@/app/home/components/iconProvider';
import NavigationMenu from '@/app/home/components/navigationMenu';

export const links = [
    { name: "inicio", href: "landing" },
    { name: "servicios", href: "servicios" },
    { name: "sobre nosotros", href: "sobre-nosotros" },
    { name: "como funciona?", href: "como-funciona" },
    { name: "registrarse", href: "signup" },
    { name: "iniciar sesion", href: "login" },
];

import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }): JSX.Element {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className='w-full bg-default'>
                    <NavigationMenu />
            </header>
            <main className='flex-grow flex items-stretch background-image bg-cover bg-center'>
                <div className="flex max-w-[1200px] mx-auto px-4 py-8">
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
    )
}