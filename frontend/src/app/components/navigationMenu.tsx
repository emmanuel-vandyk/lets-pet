"use client";
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Link,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem
} from "@nextui-org/react";
import Image from "next/image";
import iconHeader from "@/app/assets/letspet-png.png"
import * as React from "react";
import { links } from "@/constants/links";
import { usePathname } from "next/navigation";

export default function NavigationMenu() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => {
        return pathname === href;
    };

    return (

        <Navbar
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            className="bg-default h-20"
            maxWidth="2xl"
        >
            <NavbarContent className="flex items-center gap-4">
                <Image
                    src={iconHeader}
                    alt="Lets Pet"
                    width={65}
                    height={65}
                />
                <h2 className='text-h1-bold text-base'>Lets Pet!</h2>
            </NavbarContent>

            {/* Desktop navbar */}

            <NavbarContent className="hidden lg:flex items-center gap-6" justify="end">
                {links.map((link) => (
                    <NavbarItem key={link.href}>
                        <Link
                            color="secondary"
                            href={link.href}
                            className={`capitalize text-body-bold font-semibold text-xl ${isActive(link.href) ? "text-accentdark" : "text-fondodark"}`}
                            size="lg"
                        >
                            {link.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>
            
            {/* Mobile navbar */}

            <NavbarContent className="lg:hidden items-center" justify="center" >
                <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} className="bg-default" />
            </NavbarContent>

            <NavbarMenu className="pt-6 px-6 bg-default w-full">
                {links.map((link) => (
                    <NavbarMenuItem key={link.href}>
                        <Link
                            color="secondary"
                            href={link.href}
                            className="w-full capitalize text-body-bold text-3xl"
                            size="lg"
                        >
                            {link.name}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    )
}
