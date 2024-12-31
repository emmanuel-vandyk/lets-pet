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

export default function NavigationMenu() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <Navbar 
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            className="bg-default h-20 max-w-[1200px] mx-auto flex"
        >
            <NavbarContent className="lg:hidden items-center" justify="center">
                <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} className="bg-default" />
            </NavbarContent>

            <NavbarContent className="pr-3 lg:pr-0" justify="center">
                <Image
                    src={iconHeader}
                    alt="Lets Pet"
                    width={65}
                    height={65}
                />
                <h2 className='text-h1-bold text-base'>Lets Pet!</h2>
            </NavbarContent>

            <NavbarContent className="hidden lg:flex gap-6" justify="end">
                {links.map((link) => (
                    <NavbarItem key={link.href}>
                        <Link
                            color="secondary"
                            href={link.href}
                            className="capitalize text-body-bold"
                        >
                            {link.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarMenu className="pt-6 px-6 bg-default">
                {links.map((link) => (
                    <NavbarMenuItem key={link.href}>
                        <Link
                            color="secondary"
                            href={link.href}
                            className="w-full capitalize text-body-bold text-2xl"
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
