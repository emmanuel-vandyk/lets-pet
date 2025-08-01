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
            width={300}
            height={300}
          />
        </div>
        <article className='flex flex-col w-full col-span-3'>
          <div className='grid grid-flow-col w-96'>
            <Link href={'/'} passHref>
              <ArrowIcon />
            </Link>
            <h1 className='w-48 text-h1-semibold text-center font-extrabold whitespace-break-spaces'>Iniciar sesión</h1>
          </div>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className='flex flex-col w-fit justify-start items-center gap-10 bg-default pt-4 h-[32rem] md:h-[36rem] rounded-xl mt-4'
            >
              <FormItem className='px-10 mt-6 w-full max-w-[420px]'>
                <FormLabel className='text-xl after:content-["*"] after:ml-0.5 after:text-red-500'>
                  Email
                </FormLabel>
                <div className="relative">
                  <Controller
                    control={control}
                    name='email'
                    render={({ field }) => (
                      <input
                        {...field}
                        className='flex items-start w-full max-w-[420px] h-12 shadow-md p-3 outline-none text-lg rounded-md'
                      />
                    )}
                  />
                  <button
                    type='button'
                    onClick={togglePasswordVisibility}
                    className='absolute right-4 -translate-y-9 bg-transparent'
                  >
                    {showPassword ? <Eye size={24} /> : <EyeOff size={24} />}
                  </button>
                  {errors.email ? (
                    <span className='text-red-500 text-base'> {errors.email.message} </span>
                  ) : (
                    <span className='text-base invisible'> Espacio reservado </span>
                  )}
                </div>
              </FormItem>
              <FormItem className='px-10 w-full max-w-[420px]'>
                <FormLabel className='text-xl after:content-["*"] after:ml-0.5 after:text-red-500'>
                  Contraseña
                </FormLabel>
                <div className='relative'>
                  <Controller
                    control={control}
                    name='password'
                    render={({ field }) => (
                      <input
                        {...field}
                        className='flex items-start w-full max-w-[420px] h-12 shadow-md p-3 outline-none text-lg rounded-md'
                        type={showPassword ? 'text' : 'password'}
                      />
                    )}
                  />
                  <button
                    type='button'
                    onClick={togglePasswordVisibility}
                    className='absolute right-4 -translate-y-9 bg-transparent'
                  >
                    {showPassword ? <Eye size={24} /> : <EyeOff size={24} />}
                  </button>
                  {errors.password ? (
                    <span className='text-red-500 text-base'> {errors.password.message} </span>
                  ) : (
                    <span className='text-base invisible'> Espacio reservado </span>
                  )}
                  <Link href={'/auth/reset-password'} passHref>
                    <p className='text-fondodark font-semibold text-md place-self-end mt-3'>
                      ¿Olvidaste tu contraseña?
                    </p>
                  </Link>
                </div>
              </FormItem>
              <div className="px-10 w-full max-w-[420px]">
                <Button
                  className='bg-accent text-white font-bold text-xl sm:text-lg rounded-md w-full py-6'
                  type='submit'
                  disabled={isSubmitting || mutation.isPending}
                >
                  {mutation.isPending ? 'Cargando...' : 'Iniciar sesión'}
                </Button>
              </div>
              <Link href={'/auth/signup'} passHref>
                <span className='text-fondodark font-semibold text-lg'>
                  ¿No tienes cuenta? Regístrate aquí
                </span>
              </Link>
            </form>
          </FormProvider>
        </article>
      </section >
    </>
  )
}
