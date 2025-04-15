import { usePathname } from "next/navigation";

export function useRouteInfo() {
    const pathname = usePathname();


    // Determina si es una ruta privada
    const isDashboardRoute = pathname.startsWith("/dashboard/profile");

    return {
        isDashboardRoute,
        
    }
}