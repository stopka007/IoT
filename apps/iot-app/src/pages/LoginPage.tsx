import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";
import { z } from "zod";

import apiClient, { checkApiHealth, directLogin } from "../api/axiosConfig";
import { useAuth } from "../authentication/context/AuthContext";

// Define expected login response structure
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const loginSchema = z.object({
  email: z.string().email({ message: "Neplatná emailová adresa" }),
  password: z.string().min(1, { message: "Heslo je povinné" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [apiStatus, setApiStatus] = useState<"unknown" | "online" | "offline">("unknown");

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      const isHealthy = await checkApiHealth();
      setApiStatus(isHealthy ? "online" : "offline");
    };

    checkApiStatus();
  }, []);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      toast.success("Registrace úspěšná! Prosím, přihlaste se.");
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      // First check if API is reachable
      if (apiStatus === "offline") {
        const isOnline = await checkApiHealth();
        if (!isOnline) {
          toast.error("Server není dostupný. Zkuste to prosím později.");
          return;
        } else {
          setApiStatus("online");
        }
      }

      let authTokens: AuthTokens;

      try {
        // Try direct login first (bypasses interceptors)
        console.log("Attempting direct login...");
        const directResponse = await directLogin(data.email, data.password);
        authTokens = directResponse;
        console.log("Direct login succeeded");
      } catch (directErr) {
        console.error("Direct login failed, trying regular login...", directErr);

        // Fall back to regular API client
        const response = await apiClient.post<AuthTokens>("/api/auth/login", data);
        authTokens = response.data;
      }

      // Check for both tokens
      if (authTokens && authTokens.accessToken && authTokens.refreshToken) {
        // Pass the full AuthTokens object to login context
        await login({
          accessToken: authTokens.accessToken,
          refreshToken: authTokens.refreshToken,
        });
        navigate("/");
        toast.success("Přihlášení úspěšné!");
      } else {
        throw new Error("Odpověď serveru neobsahuje potřebné autentizační tokeny.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      let errorMessage = "Přihlášení selhalo. Zkontrolujte přihlašovací údaje nebo stav serveru.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        // errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Přihlášení</h2>

        {apiStatus === "offline" && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            Server momentálně není dostupný. Zkontrolujte připojení k internetu.
          </div>
        )}

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
          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Heslo
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password")}
                placeholder="Password..."
                className={`shadow appearance-none border ${errors.password ? "border-red-500" : ""} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50 pr-10`}
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
            {errors.password && (
              <p className="text-red-500 text-xs italic mt-1">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-200 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Přihlašuji..." : "Přihlásit se"}
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link to="/register" className="text-sm text-blue-500 hover:underline">
              Nemáte účet? Registrovat se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
