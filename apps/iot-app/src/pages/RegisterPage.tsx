import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";
import { z } from "zod";

import apiClient from "../api/axiosConfig";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const passwordValidation = z
  .string()
  .min(8, { message: "Heslo musí mít alespoň 8 znaků" })
  .regex(/[a-z]/, { message: "Heslo musí obsahovat alespoň jedno malé písmeno" })
  .regex(/[A-Z]/, { message: "Heslo musí obsahovat alespoň jedno velké písmeno" })
  .regex(/[0-9]/, { message: "Heslo musí obsahovat alespoň jednu číslici" })
  .regex(/[@$!%*?&]/, {
    message: "Heslo musí obsahovat alespoň jeden speciální znak (@$!%*?&)",
  });

const registerSchema = z
  .object({
    email: z.string().email({ message: "Neplatná emailová adresa" }),
    username: z.string().min(1, { message: "Uživatelské jméno je povinné" }),
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Hesla se neshodují",
    path: ["confirmPassword"],
  });

function RegisterPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });
  const navigate = useNavigate();

  const passwordValue = useWatch({ control, name: "password" });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    const registrationData = {
      email: data.email,
      username: data.username,
      password: data.password,
    };

    try {
      await apiClient.post("/api/users", registrationData);
      navigate("/login?registered=true");
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Registrace selhala. Zkuste to prosím znovu.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Registrace</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              placeholder="your.email@example.com"
              className={`shadow appearance-none border ${errors.email ? "border-red-500" : ""} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50`}
              required
              disabled={isSubmitting}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Uživatelské jméno
            </label>
            <input
              type="text"
              id="username"
              {...register("username")}
              placeholder="Zvolte si uživatelské jméno"
              className={`shadow appearance-none border ${errors.username ? "border-red-500" : ""} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50`}
              required
              disabled={isSubmitting}
              aria-invalid={errors.username ? "true" : "false"}
            />
            {errors.username && (
              <p className="text-red-500 text-xs italic mt-1">{errors.username.message}</p>
            )}
          </div>
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Heslo
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password")}
                placeholder="Vytvořte si heslo"
                className={`shadow appearance-none border ${errors.password ? "border-red-500" : ""} rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50 pr-10`}
                required
                disabled={isSubmitting}
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-800"
                aria-label={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
            <PasswordStrengthMeter password={passwordValue} />
            {errors.password && (
              <p className="text-red-500 text-xs italic mt-1">{errors.password.message}</p>
            )}
          </div>
          <div className="mb-6 relative">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
              Potvrdit Heslo
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                {...register("confirmPassword")}
                placeholder="Potvrďte své heslo"
                className={`shadow appearance-none border ${errors.confirmPassword ? "border-red-500" : ""} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50 pr-10`}
                required
                disabled={isSubmitting}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-800"
                aria-label={
                  showConfirmPassword ? "Skrýt potvrzení hesla" : "Zobrazit potvrzení hesla"
                }
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs italic mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-200 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registruji..." : "Registrovat se"}
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-500 hover:underline">
              Již máte účet? Přihlásit se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
