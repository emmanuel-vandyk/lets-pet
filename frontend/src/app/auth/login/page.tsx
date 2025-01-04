'use client';
import { FormItem, FormLabel } from '@/components/ui/form';
import { FormProvider, Controller, useForm } from 'react-hook-form';
import { ArrowIcon } from '@/app/components/iconProvider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import dog from '@/app/assets/dog.webp';
import { usePasswordToggle } from '@/hooks/usePasswordToggle';
import { Eye, EyeOff } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from '@/schema/authSchema';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/api/auth/authService';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { ErrorTypes } from '@/types/errorTypes';
import { LoginUserDto } from '@/api/dto/loginUserDto';


export default function Login(): JSX.Element {
  const router = useRouter();
  const { showPassword, togglePasswordVisibility } = usePasswordToggle();

  // configuración del formulario
  const methods = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, control, formState: { errors, isSubmitting } } = methods;

  // Configuración de la mutación
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      Cookies.set("authToken", data.token, { secure: true, sameSite: "strict" })
      router.push("/dashboard/profile");
    },
    onError: (error: ErrorTypes) => {
      alert(
        error.response?.data?.message || error.message || "Error al iniciar sesión."
      );
    }
  });

  // Handler para el ennvío del formulario
  const handleFormSubmit = (data: LoginUserDto) => {
    // Ejecuta la mutación
    mutation.mutate(data);
  };

  return (
    <>
      <section className='grid grid-flow-col w-full md:justify-around items-center justify-center max-h-screen'>
        <div className='hidden md:grid place-self-end place-items-center w-full'>
          <Image
            src={dog}
            alt='Lets Pet'
            width={250}
          />
        </div>
        <article className='flex flex-col w-full col-span-3'>
          <div className='grid grid-flow-col w-96'>
            <Link href={'/'} passHref>
              <ArrowIcon />
            </Link>
            <h1 className='w-96 text-h1-semibold text-center font-extrabold whitespace-break-spaces'>Iniciar sesión</h1>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col w-fit justify-start items-center gap-7 bg-default pt-4 h-[26rem] rounded-xl mt-4 '>
              <FormItem className='px-10 mt-4'>
                <FormLabel className='text-lg  after:content-["*"] after:ml-0.5 after:text-red-500'> Email </FormLabel>
                <Controller
                  control={control}
                  name='email'
                  render={({ field }) => <input {...field} className='flex items-start w-96 shadow-md p-1 outline-none' />}
                />
                {errors.email ? (
                  <span className='text-red-500 text-sm'> {errors.email.message} </span>
                ) : (
                  <span className='text-sm invisible'> Espacio reservado </span>
                )}
              </FormItem>
              <FormItem className='px-10'>
                <FormLabel className='text-lg after:content-["*"] after:ml-0.5 after:text-red-500'> Contraseña </FormLabel>
                <div className='relative'>
                  <Controller
                    control={control}
                    name='password'
                    render={({ field }) => <input {...field} className='flex items-start w-96 shadow-md p-1 outline-none'
                      type={showPassword ? 'text' : 'password'}
                    />}
                  />
                  <button
                    type='button'
                    onClick={togglePasswordVisibility}
                    className='absolute -translate-y-6 right-2 bg-transparent'
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  {errors.password ? (
                    <span className='text-red-500 text-sm'> {errors.password.message} </span>
                  ) : (
                    <span className='text-sm invisible'> Espacio reservado </span>
                  )}
                  <Link href={'/auth/reset-password'} passHref>
                    <p className='text-fondodark font-semibold text-md place-self-end mt-2'>¿Olvidaste tu contraseña?</p>
                  </Link>

                </div>
              </FormItem>
              <Button className='bg-accent text-white font-bold text-lg sm:text-md rounded-md w-full max-w-96 py-6 md:py-5'
                type='submit'
                disabled={isSubmitting || mutation.isPending} // Deshabilita el botón mientras carga
              >
                {mutation.isPending ? 'Cargando...' : 'Iniciar sesión'}
              </Button>
              <Link href={'/auth/signup'} passHref>
                <span className='text-fondodark font-semibold text-md'>¿No tienes cuenta? Regístrate aquí</span>
              </Link>
            </form>
          </FormProvider>
        </article>
      </section >
    </>
  )
}
