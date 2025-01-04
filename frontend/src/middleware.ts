import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(request: NextRequest) {
   const token = request.cookies.get("token");
   console.log(token);
   const url = request.nextUrl.pathname;

    // Verificar si el usuario intenta acceder a una ruta protegida
    const protectedRoutes = ["/dashboard/pets", "/dashboard/appointments"];

    // Si el token no existe y el usuario intenta acceder a una ruta protegida 
    if (protectedRoutes.includes(url) && !token) {
        return NextResponse.redirect("/auth/login"); // Redirigir a la página de inicio de sesión
    }


   // Si el token existe, y el usuario esta intentando acceder a la pagina de login, redirigir al dashbaord (o pagina de inicio)
   if (url === "/auth/login" && token) {
       return NextResponse.redirect("/dashboard");
   }

   return NextResponse.next(); // Continuar con la solicitud
}


export const config = {
    matcher: ["/dashboard/", "/dashboard/profile", "/dashboard/pets", "/dashboard/appointments", "/auth/login"], 
};