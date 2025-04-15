import z from 'zod';

const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Define the schema for the login form
export const authSchema = z.object({
  email: z
    .string()
    .email({ message: 'El email debe tener un formato válido.' })
    .min(5, { message: 'El email debe tener al menos 5 caracteres.' })
    .max(50, { message: 'El email no puede tener más de 50 caracteres.' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    .max(16, { message: 'La contraseña no puede tener más de 16 caracteres.' })
    .regex(passwordRegex, {
      message:
        'La contraseña debe incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
    }),
});