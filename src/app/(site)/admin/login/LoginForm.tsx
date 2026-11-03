"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, LogIn } from "lucide-react";
import { PasswordInput } from "@/features/admin/PasswordInput";
import { CSRF_HEADER } from "@/lib/auth/session";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username").max(64),
  password: z.string().min(1, "Enter your password").max(128),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ next, expired }: { next: string; expired?: boolean }) {
  const [error, setError] = useState<string | null>(expired ? "Your session has ended. Please sign in again." : null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", [CSRF_HEADER]: "1" },
        body: JSON.stringify(values),
      });
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(
          res.status === 429
            ? "Too many sign-in attempts. Please wait a few minutes."
            : res.status === 423
              ? body.message ?? "This account is temporarily locked. Try again later."
              : body.message ?? "Invalid username or password",
        );
        return;
      }
      // Full navigation so the new HttpOnly cookie is used by the server render
      window.location.assign(next);
    } catch {
      setError("Unable to reach the sign-in service. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "grid", gap: 18 }}>
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={18} aria-hidden />
          <span>{error}</span>
        </div>
      )}
      <div className="field">
        <label className="field-label" htmlFor="login-username">
          Username
        </label>
        <input
          id="login-username"
          className="input"
          autoComplete="username"
          autoFocus
          aria-invalid={errors.username ? true : undefined}
          aria-describedby={errors.username ? "login-username-error" : undefined}
          {...register("username")}
        />
        {errors.username && (
          <p id="login-username-error" className="field-error">
            {errors.username.message}
          </p>
        )}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="login-password">
          Password
        </label>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="login-password-error" className="field-error">
            {errors.password.message}
          </p>
        )}
      </div>
      <button type="submit" className="btn btn-dark" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? <span className="spinner" aria-hidden /> : <LogIn size={18} aria-hidden />}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
