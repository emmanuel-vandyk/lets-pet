import z from 'zod';

const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Define the schema for the register form

export const signupSchema = z.object({
    name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }).max(20, { message: 'El nombre no puede exceder 20 caracteres.' }),
    lastName: z.string().min(3, { message: 'El apellido debe tener al menos 3 caracteres.' }).max(20, { message: 'El apellido no puede exceder 20 caracteres.' }),
    email: z.string().email({ message: 'El correo electrónico debe ser válido.' }).nonempty({ message: 'El correo electrónico es obligatorio.' }),
    password: z.string()
      .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
      .max(16, { message: 'La contraseña no puede exceder 16 caracteres.' })
      .regex(passwordRegex, { message: 'La contraseña debe incluir al menos una letra mayúscula, una minúscula, un número y un carácter especial.' }),
    confirmPassword: z.string()
      .min(6, { message: 'La confirmación de la contraseña debe tener al menos 6 caracteres.' })
      .max(16, { message: 'La confirmación de la contraseña no puede exceder 16 caracteres.' })
      .regex(passwordRegex, { message: 'La confirmación debe coincidir con los requisitos de la contraseña.' }),
    terms: z.boolean().refine((value) => value === true, { message: 'Debes aceptar los términos y condiciones.' }),
  });