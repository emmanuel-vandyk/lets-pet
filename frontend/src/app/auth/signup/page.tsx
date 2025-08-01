"use client";
import * as React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel } from "@/components/ui/form";
import { ArrowIcon } from "@/app/components/iconProvider";
import Link from "next/link";
import Image from "next/image";
import cat from "@/app/assets/cat.webp";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/schema/signupSchema";
import { Eye, EyeOff } from "lucide-react";
import { usePasswordToggle } from "@/hooks/usePasswordToggle";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/api/auth/authService";
import Cookies from "js-cookie";
import { ErrorTypes } from "@/types/errorTypes";
import { RegisterUserDto } from "@/api/dto/registerUserDto";

export default function Signup() {
  const router = useRouter();
  const { showPassword, togglePasswordVisibility } = usePasswordToggle();

  // Configuración del formulario
  const methods = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  // Configuración de la mutación
  const mutation = useMutation({
    mutationKey: ["registerUser"],
    mutationFn: registerUser,
    onMutate: () => {
      console.log("Iniciando mutación...");
    },
    onSuccess: (data) => {
      Cookies.set("authToken", data.token, {
        secure: true,
        sameSite: "strict",
      });
      router.push("/dashboard/profile");
    },
    onError: (error: ErrorTypes) => {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Error al registrarse."
      );
    },
  });

  // Handler para el envío del formulario
  const handleFormSubmit = (data: RegisterUserDto) => {
    // Ejecuta la mutación
    mutation.mutate(data);
  };

  return (
    <>
      <section className="flex w-1/2 justify-center items-center max-h-screen mx-auto">
        <article className="flex flex-col place-items-end">
          <div className="flex w-full">
            <Link href={"/"} passHref>
              <ArrowIcon />
            </Link>
            <h1 className="flex justify-center md:items-center md:justify-center w-full text-h1-semibold text-center font-extrabold whitespace-break-spaces">
              Registrarse
            </h1>
          </div>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="gap-2 bg-default pt-6 pb-10 my-4 rounded-xl w-[420px] md:w-[500px] mx-auto"
            >
              <FormItem className="px-14 md:mt-4 w-full">
                <FormLabel className='text-lg after:content-["*"] after:ml-0.5 after:text-red-500'>
                  {" "}
                  Nombre{" "}
                </FormLabel>
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="flex items-center shadow-md p-2 outline-none w-full text-base"
                    />
                  )}
                />
                {errors.name ? (
                  <span className="text-red-500 text-sm">
                    {" "}
                    {errors.name.message}{" "}
                  </span>
                ) : (
                  <span className="text-sm invisible"> Espacio reservado </span>
                )}
              </FormItem>
              <FormItem className="px-14 md:mt-4 w-full">
                <FormLabel className='text-lg after:content-["*"] after:ml-0.5 after:text-red-500'>
                  {" "}
                  Apellido{" "}
                </FormLabel>
                <Controller
                  control={methods.control}
                  name="lastName"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="flex items-start shadow-md p-2 outline-none w-full text-base"
                    />
                  )}
                />
                {errors.lastName ? (
                  <span className="text-red-500 text-sm w-fit">
                    {" "}
                    {errors.lastName.message}{" "}
                  </span>
                ) : (
                  <span className="text-sm invisible"> Espacio reservado </span>
                )}
              </FormItem>
              <FormItem className="px-14 w-full">
                <FormLabel className='text-lg after:content-["*"] after:ml-0.5 after:text-red-500'>
                  {" "}
                  Email{" "}
                </FormLabel>
                <Controller
                  control={methods.control}
                  name="email"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="flex items-center shadow-md p-2 outline-none w-full text-base"
                    />
                  )}
                />
                {errors.email ? (
                  <span className="text-red-500 text-sm">
                    {" "}
                    {errors.email.message}{" "}
                  </span>
                ) : (
                  <span className="text-sm invisible"> Espacio reservado </span>
                )}
              </FormItem>
              <FormItem className="px-14 w-full">
                <FormLabel className='text-lg after:content-["*"] after:ml-0.5 after:text-red-500'>
                  {" "}
                  Contraseña{" "}
                </FormLabel>
                <div className="relative">
                  <Controller
                    control={methods.control}
                    name="password"
                    render={({ field }) => (
                      <input
                        {...field}
                        className="flex items-start shadow-md p-2 outline-none w-full text-base"
                        type={showPassword ? "text" : "password"}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute -translate-y-7 right-2 bg-transparent"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  {errors.password ? (
                    <span className="text-red-500 text-sm">
                      {" "}
                      {errors.password.message}{" "}
                    </span>
                  ) : (
                    <span className="text-sm invisible">
                      {" "}
                      Espacio reservado{" "}
                    </span>
                  )}
                </div>
              </FormItem>
              <FormItem className="px-14 w-full">
                <FormLabel className='text-lg after:content-["*"] after:ml-0.5 after:text-red-500'>
                  {" "}
                  Confirmar contraseña{" "}
                </FormLabel>
                <div className="relative">
                  <Controller
                    control={methods.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <input
                        {...field}
                        className="flex items-start shadow-md p-2 outline-none w-full text-base"
                        type={showPassword ? "text" : "password"}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute -translate-y-7 right-2 bg-transparent"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  {errors.confirmPassword ? (
                    <span className="text-red-500 text-sm">
                      {" "}
                      {errors.confirmPassword.message}{" "}
                    </span>
                  ) : (
                    <span className="text-sm invisible">
                      {" "}
                      Espacio reservado{" "}
                    </span>
                  )}
                </div>
              </FormItem>
              <FormItem className='text-lg after:content-["*"] after:ml-0.5 after:text-red-500 w-full'>
                <article className="flex flex-col md:justify-evenly items-start col-span-1 mx-14 w-full">
                  <Controller
                    control={control}
                    name="terms"
                    render={({ field }) => (
                      <div className="flex items-center justify-center space-x-2">
                        <Checkbox
                          id="terms"
                          className="bg-white text-center"
                          checked={field.value} // Asegura que el estado esté sincronizado
                          onCheckedChange={(checked) =>
                            field.onChange(!!checked)
                          } // Actualiza el estado
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Aceptar términos y condiciones
                        </label>
                      </div>
                    )}
                  />
                  {errors.terms ? (
                    <span className="text-red-500 text-sm">
                      {" "}
                      {errors.terms.message}{" "}
                    </span>
                  ) : (
                    <span className="text-sm invisible">
                      {" "}
                      Espacio reservado{" "}
                    </span>
                  )}
                </article>
              </FormItem>
              <div className="flex justify-center w-full">
                <Button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                  className="w-full bg-accent text-white font-bold text-lg sm:text-md rounded-md py-6 md:py-5 mx-14"
                >
                  {mutation.isPending ? "Cargando..." : "Registrarse"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </article>
        <div className="hidden md:grid place-self-end place-items-center place-content-end w-4/6">
          <Image src={cat} alt="Lets Pet" width={365} height={365} />
        </div>
      </section>
    </>
  );
}
