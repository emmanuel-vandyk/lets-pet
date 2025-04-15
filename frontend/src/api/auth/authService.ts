"use client";

import api from "../baseApi";
import { LoginUserDto } from "../dto/loginUserDto";
import { RegisterUserDto } from "../dto/registerUserDto";

// Interfaz para los datos del formulario frontend
interface SignupFormData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

// Función adaptadora para transformar los nombres de los campos
function adaptRegisterData(formData: SignupFormData): RegisterUserDto {
  return {
    firstName: formData.name, // Convertir name -> firstName
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password,
    passwordConfirmation: formData.confirmPassword, // Convertir confirmPassword -> passwordConfirmation
    terms: formData.terms,
  };
}

async function registerUser(credentials: SignupFormData) {
  try {
    // Adaptar los datos del formulario al formato que espera el backend
    const adaptedData = adaptRegisterData(credentials);

    console.log(
      "Enviando solicitud a:",
      api.defaults.baseURL + "/auth/register"
    );
    console.log("Datos originales:", credentials);
    console.log("Datos adaptados:", adaptedData);

    const { data } = await api.post("/auth/register", adaptedData);
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
