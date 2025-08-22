"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  User,
  Loader2,
  Mail,
  Building,
  ShieldCheck,
  MailQuestion,
  Sparkles,
  AlertTriangle,
  Cpu,
  Bot,
  FileCheck2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Tab } from "@headlessui/react";
import clsx from "clsx";

// --- Placeholder Icons for SSO Providers ---
const GoogleIcon = () => <div className="w-5 h-5 bg-slate-200 rounded-full" />;
const MicrosoftIcon = () => <div className="w-5 h-5 bg-slate-200" />;

// --- Main Login Page Component ---
export default function LoginPage() {
  const [view, setView] = useState("credentials"); // credentials, mfa, forgotPassword
  const [message, setMessage] = useState({ type: "", text: "" }); // { type: 'error' | 'success', text: '...' }
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    const { username, password } = e.target.elements;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (username.value === "director" && password.value === "password") {
      setView("mfa");
    } else {
      setMessage({ type: "error", text: "Invalid username or password." });
    }
    setIsLoading(false);
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    const { mfa_code } = e.target.elements;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (mfa_code.value === "123456") {
      router.push("/");
    } else {
      setMessage({ type: "error", text: "Invalid authentication code." });
    }
    setIsLoading(false);
  };

  const handleSsoSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setMessage({
      type: "error",
      text: "SSO for this email is not configured. Please contact your administrator.",
    });
    setIsLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setMessage({
      type: "success",
      text: "If an account with that email exists, a password reset link has been sent.",
    });
    setIsLoading(false);
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
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}>
                {view === "credentials" && (
                  <CredentialsView
                    onSubmit={handleCredentialsSubmit}
                    onSsoSubmit={handleSsoSubmit}
                    message={message}
                    isLoading={isLoading}
                    onForgotPassword={() => {
                      setView("forgotPassword");
                      setMessage({ type: "", text: "" });
                    }}
                  />
                )}
                {view === "mfa" && (
                  <MfaView
                    onSubmit={handleMfaSubmit}
                    message={message}
                    isLoading={isLoading}
                    onBack={() => {
                      setView("credentials");
                      setMessage({ type: "", text: "" });
                    }}
                  />
                )}
                {view === "forgotPassword" && (
                  <ForgotPasswordView
                    onSubmit={handlePasswordReset}
                    message={message}
                    isLoading={isLoading}
                    onBack={() => {
                      setView("credentials");
                      setMessage({ type: "", text: "" });
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400 space-y-2">
            <p>
              For security and compliance, all login attempts are logged with IP
              address and timestamp.
            </p>
            <p>
              <a href="#" className="underline hover:text-slate-600">
                Terms of Service
              </a>{" "}
              &middot;{" "}
              <a href="#" className="underline hover:text-slate-600">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: The Brand Statement */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gray-900 object-cover flex flex-col justify-center p-12 text-left">
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

const MessageDisplay = ({ message }) => {
  if (!message.text) return null;
  const styles = {
    error: "bg-red-50 text-red-700",
    success: "bg-green-50 text-green-700",
  };
  return (
    <div
      className={clsx(
        "rounded-md p-3 text-sm font-medium",
        styles[message.type]
      )}>
      {message.text}
    </div>
  );
};

// --- Sub-component for Credentials View ---
const CredentialsView = ({
  onSubmit,
  onSsoSubmit,
  message,
  isLoading,
  onForgotPassword,
}) => {
  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl bg-slate-100 p-1">
        <Tab as={Fragment}>
          {({ selected }) => (
            <button
              className={clsx(
                "w-full rounded-lg py-2.5 text-sm font-semibold leading-5",
                "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60",
                selected
                  ? "bg-white shadow text-blue-700"
                  : "text-slate-600 hover:bg-white/[0.5]"
              )}>
              Password
            </button>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <button
              className={clsx(
                "w-full rounded-lg py-2.5 text-sm font-semibold leading-5",
                "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60",
                selected
                  ? "bg-white shadow text-blue-700"
                  : "text-slate-600 hover:bg-white/[0.5]"
              )}>
              Single Sign-On
            </button>
          )}
        </Tab>
      </Tab.List>
      <Tab.Panels className="mt-2">
        <Tab.Panel className="p-1 focus:outline-none">
          <form onSubmit={onSubmit} className="space-y-6 mt-6">
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
                  className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end text-sm">
              <button
                type="button"
                onClick={onForgotPassword}
                className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </button>
            </div>
            <MessageDisplay message={message} />
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-gray-900 py-2.5 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60">
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </div>
          </form>
        </Tab.Panel>
        <Tab.Panel className="p-1 focus:outline-none">
          <form onSubmit={onSsoSubmit} className="space-y-6 mt-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700">
                Work Email
              </label>
              <div className="relative mt-1">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@company.com"
                  className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <MessageDisplay message={message} />
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-gray-900 py-2.5 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60">
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Continue with SSO
              </button>
            </div>
          </form>
          <div className="relative my-6">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">
                Or use a provider
              </span>
            </div>
          </div>
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
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

// --- Sub-component for MFA View ---
const MfaView = ({ onSubmit, message, isLoading, onBack }) => {
  return (
    <div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800">
          Two-Factor Authentication
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter the code from your authenticator app.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6 mt-8">
        <div>
          <label htmlFor="mfa_code" className="sr-only">
            Authentication Code
          </label>
          <div className="relative mt-1">
            <ShieldCheck
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              id="mfa_code"
              name="mfa_code"
              type="text"
              autoComplete="one-time-code"
              required
              maxLength="6"
              pattern="\d{6}"
              placeholder="123456"
              className="text-center tracking-[0.5em] font-mono block w-full appearance-none rounded-md border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <MessageDisplay message={message} />
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-gray-900 py-2.5 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60">
            {isLoading && <Loader2 size={16} className="animate-spin" />}Verify
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm font-medium text-slate-600 hover:text-slate-900">
            Back to sign in
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Sub-component for Forgot Password View ---
const ForgotPasswordView = ({ onSubmit, message, isLoading, onBack }) => {
  return (
    <div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800">
          Forgot Password
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email to receive a password reset link.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6 mt-8">
        <div>
          <label htmlFor="reset_email" className="sr-only">
            Email
          </label>
          <div className="relative mt-1">
            <MailQuestion
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              id="reset_email"
              name="reset_email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
              className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <MessageDisplay message={message} />
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center items-center gap-2 rounded-md border border-transparent bg-gray-900 py-2.5 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60">
            {isLoading && <Loader2 size={16} className="animate-spin" />}Send
            Reset Link
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full text-sm font-medium text-slate-600 hover:text-slate-900">
            Back to sign in
          </button>
        </div>
      </form>
    </div>
  );
};
