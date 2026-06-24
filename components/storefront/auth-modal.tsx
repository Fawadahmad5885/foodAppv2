"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { signIn, signUp } from "@/lib/actions/auth";
import { useAuth } from "@/context/auth-context";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthModalMode,
    setUser,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isAuthModalOpen) return;
    setPassword("");
    setName("");
    setPhone("");
    setError(null);
  }, [isAuthModalOpen, authModalMode]);

  useEffect(() => {
    if (!isAuthModalOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeAuthModal();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn(email, password);

      if (result.success) {
        setUser(result.user);
        closeAuthModal();
        return;
      }

      if (result.error === "USER_NOT_FOUND") {
        setAuthModalMode("signup");
        setError("No account found with this email. Create one below.");
        return;
      }

      if (result.error === "NOT_CUSTOMER") {
        setError("This account cannot be used for customer sign-in.");
        return;
      }

      setError("Incorrect password. Please try again.");
    });
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signUp(email, password, name, phone);

      if (result.success) {
        setUser(result.user);
        closeAuthModal();
        return;
      }

      if (result.error === "EMAIL_EXISTS") {
        setAuthModalMode("signin");
        setError("An account with this email already exists. Sign in instead.");
        return;
      }

      setError(
        "Please fill in all fields including mobile number. Password must be at least 6 characters.",
      );
    });
  }

  const isSignIn = authModalMode === "signin";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/50"
        onClick={closeAuthModal}
        aria-label="Close dialog"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-primary px-6 py-5 text-center">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 rounded-full p-1.5 text-stone-700 transition hover:bg-black/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <h2
            id="auth-modal-title"
            className="text-lg font-bold text-stone-900"
          >
            {isSignIn ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-stone-700/80">
            {isSignIn
              ? "Sign in to track orders and checkout faster"
              : "Join Fiestaa to save your details for next time"}
          </p>
        </div>

        <form
          onSubmit={isSignIn ? handleSignIn : handleSignUp}
          className="space-y-4 p-5"
        >
          {!isSignIn && (
            <>
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-sm font-medium text-stone-700"
                >
                  Full name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none ring-primary focus:ring-2"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-phone"
                  className="block text-sm font-medium text-stone-700"
                >
                  Mobile number
                </label>
                <input
                  id="auth-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none ring-primary focus:ring-2"
                  placeholder="+1 555 000 0000"
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-sm font-medium text-stone-700"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none ring-primary focus:ring-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-sm font-medium text-stone-700"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete={isSignIn ? "current-password" : "new-password"}
              minLength={isSignIn ? undefined : 6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none ring-primary focus:ring-2"
              placeholder={isSignIn ? "Your password" : "At least 6 characters"}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-stone-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignIn ? "Sign in" : "Create account"}
          </button>

          <p className="text-center text-sm text-stone-500">
            {isSignIn ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode("signup");
                    setError(null);
                  }}
                  className="font-semibold text-stone-900 underline-offset-2 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode("signin");
                    setError(null);
                  }}
                  className="font-semibold text-stone-900 underline-offset-2 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
