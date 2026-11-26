"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result =
      mode === "signup"
        ? await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL: "/dashboard",
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
          });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Something went wrong.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const isSignup = mode === "signup";

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isSignup ? "Start scheduling in under a minute." : "Log in to manage your event types."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {pending ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
