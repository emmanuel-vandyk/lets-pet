"use client";

import api from "../baseApi";
import { LoginUserDto } from "../dto/loginUserDto";
import { RegisterUserDto } from "../dto/registerUserDto";

async function registerUser(credentials: RegisterUserDto) {
  try {
    console.log(
      "Enviando solicitud a:",
      api.defaults.baseURL + "/auth/register"
    );
    console.log("Datos:", credentials);
    const { data } = await api.post("/auth/register", credentials);
    console.log("Respuesta:", data);
    return data;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
}

async function loginUser(credentials: LoginUserDto) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export { registerUser, loginUser };
