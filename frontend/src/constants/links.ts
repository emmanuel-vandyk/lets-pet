type Link = {
    name: string;
    href: string;
}

export const links: Link[] = [
    { name: "inicio", href: "/home/" },
    { name: "servicios", href: "/#servicios" },
    { name: "sobre nosotros", href: "/#sobre-nosotros" },
    { name: "como funciona?", href: "/#como-funciona" },
    { name: "registrarse", href: "/auth/signup/" },
    { name: "iniciar sesion", href: "/auth/login/" },
];

export const linksDashboard: Link[] = [
    { name: "inicio", href: "/dashboard/home/" },
    { name: "mi perfil", href: "/dashboard/profile/" },
    { name: "mis mascotas", href: "/dashboard/pets/" },
    { name: "mis citas", href: "/dashboard/appointments/" },
    { name: "salir", href: "/auth/logout/" },
];