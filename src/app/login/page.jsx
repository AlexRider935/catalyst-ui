"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, User, Loader2, Mail, Building } from "lucide-react";

// --- Placeholder Icons for SSO Providers ---
// As directed, I am not using inline SVG code. You will replace these
// with the appropriate library components or your own SVG assets.
const GoogleIcon = () => <div className="w-5 h-5 bg-red-500 rounded-full" />;
const MicrosoftIcon = () => <div className="w-5 h-5 bg-blue-500 rounded-sm" />;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (username === "director" && password === "password") {
      router.push("/");
    } else {
      setError("Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-white">
      {/* Left Panel: The Authentication Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              C
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                The Catalyst
              </h2>
              <p className="text-sm text-gray-600">
                Sign in to your command center
              </p>
            </div>
          </div>

          <div className="mt-10">
            {/* SSO Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="inline-flex w-full justify-center items-center gap-3 rounded-md border border-slate-300 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button className="inline-flex w-full justify-center items-center gap-3 rounded-md border border-slate-300 bg-white py-2.5 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <MicrosoftIcon />
                <span>Microsoft</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative mt-1">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <KeyRound
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-gray-900 py-2.5 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60">
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? "Authenticating..." : "Sign In"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500">
                Sign in with a Magic Link
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: The Brand Statement */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gray-900 object-cover flex flex-col items-center justify-center p-12 text-left">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Accelerating Security.
            </h1>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white/70 sm:text-5xl">
              Simplifying Compliance.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              The Catalyst transforms security data into actionable
              intelligence, streamlining your path to a compliant and fortified
              infrastructure.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
