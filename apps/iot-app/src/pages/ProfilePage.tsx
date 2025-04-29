import React, { useState } from "react";
// Import form handling, validation, icons, api, toast, strength meter
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { zodResolver } from "@hookform/resolvers/zod";

import axios from "axios";
// Keep for error checking
import { z } from "zod";

import apiClient from "../api/axiosConfig";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuth } from "../context/AuthContext";

// Re-use or import password validation logic from RegisterPage
const passwordValidation = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[@$!%*?&]/, {
    message: "Password must contain at least one special character (@$!%*?&)",
  });

// Schema for the change password form
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Současné heslo je povinné" }),
    newPassword: passwordValidation,
    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"], // Apply error to the confirmation field
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// TODO: Implement user profile display and editing functionality
function ProfilePage() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    reset, // Get reset function from useForm
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur", // Validate on blur
  });

  // Watch the new password value for the strength meter
  const newPasswordValue = useWatch({ control, name: "newPassword" });

  // States for password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Define the submit handler function
  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await apiClient.patch("/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully!");
      reset();
    } catch (err) {
      console.error("Password change failed:", err);
      let errorMessage = "Failed to update password. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        // Potentially handle other errors or just keep generic message
      }
      toast.error(errorMessage);
    }
  };

  if (!user) {
    return <div className="p-4">Loading user data...</div>;
  }

  return (
    <div className={`p-6 max-w-4xl mx-auto min-h-full`}>
      <h1 className="text-3xl font-bold mb-6 border-b pb-2">Uživatelský Profil</h1>

      {/* Display User Info */}
      <div className="mb-8 shadow rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
        <h2 className="text-xl font-semibold mb-4">Detaily Účtu</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Uživatelské jméno:</span> {user.username}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="shadow rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
        <h2 className="text-xl font-semibold mb-4">Změnit Heslo</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Current Password */}
          <div className="relative">
            <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
              Současné Heslo
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                {...register("currentPassword")}
                className={`shadow-sm appearance-none border ${errors.currentPassword ? "border-red-500" : "border-gray-400 dark:border-neutral-600"} rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 pr-10`}
                required
                disabled={isSubmitting}
                aria-invalid={errors.currentPassword ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={
                  showCurrentPassword ? "Skrýt současné heslo" : "Zobrazit současné heslo"
                }
              >
                {showCurrentPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs italic mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="relative">
            <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
              Nové Heslo
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                {...register("newPassword")}
                className={`shadow-sm appearance-none border ${errors.newPassword ? "border-red-500" : "border-gray-400 dark:border-neutral-600"} rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 pr-10`}
                required
                disabled={isSubmitting}
                aria-invalid={errors.newPassword ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={showNewPassword ? "Skrýt nové heslo" : "Zobrazit nové heslo"}
              >
                {showNewPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
            <PasswordStrengthMeter password={newPasswordValue} />
            {errors.newPassword && (
              <p className="text-red-500 text-xs italic mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-1">
              Potvrdit Nové Heslo
            </label>
            <div className="relative">
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                id="confirmNewPassword"
                {...register("confirmNewPassword")}
                className={`shadow-sm appearance-none border ${errors.confirmNewPassword ? "border-red-500" : "border-gray-400 dark:border-neutral-600"} rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 pr-10`}
                required
                disabled={isSubmitting}
                aria-invalid={errors.confirmNewPassword ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={
                  showConfirmNewPassword
                    ? "Skrýt potvrzení nového hesla"
                    : "Zobrazit potvrzení nového hesla"
                }
              >
                {showConfirmNewPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Aktualizuji..." : "Aktualizovat Heslo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
