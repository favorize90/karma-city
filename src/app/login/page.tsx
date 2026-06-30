"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { KarmaCoinIcon } from "@/components/KarmaCoin";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

type Mode = "magic" | "password" | "magic-sent";

function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/app";

  // In the native app the magic-link redirect can't return into the WebView
  // (no Universal Links without an Apple account), so default to password there.
  const isNative = Capacitor.isNativePlatform();
  const [mode, setMode] = useState<Mode>(isNative ? "password" : "magic");
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = (() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  })();

  const envMissing = !supabase;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading("magic");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    setLoading(null);
    if (error) setError(error.message);
    else setMode("magic-sent");
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading("password");
    const action = isSignup
      ? supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          },
        })
      : supabase.auth.signInWithPassword({ email, password });
    const { error } = await action;
    setLoading(null);
    if (error) setError(error.message);
    else if (isSignup) setMode("magic-sent");
    else router.push(redirectTo);
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(
      `${provider === "google" ? "Google" : "Apple"}-Login wird derzeit eingerichtet. Nutze in der Zwischenzeit Magic-Link oder E-Mail + Passwort.`,
    );
  };

  return (
    <div className="relative min-h-[100dvh] bg-zinc-950 text-white overflow-hidden">
      {/* Backdrop image with overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/hero-community.jpg"
          alt=""
          className="h-full w-full object-cover object-center scale-105 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950/85 to-zinc-950/60" />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* Top bar */}
        <header className="px-6 py-5 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} /> zur Startseite
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
            className="w-full max-w-md"
          >
            {/* Brand */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <KarmaCoinIcon size={32} />
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {mode === "magic-sent"
                  ? "Check deine Mailbox"
                  : isSignup
                    ? "Mach mit bei Karma City"
                    : "Willkommen zurück"}
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                {mode === "magic-sent"
                  ? `Wir haben dir einen Link an ${email} geschickt.`
                  : isSignup
                    ? "Sammle Karma für deine Stadt"
                    : "Melde dich an, um Missionen zu finden."}
              </p>
            </div>

            {/* Card */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-6 md:p-7 shadow-2xl shadow-black/50">
              {envMissing && (
                <div className="mb-5 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <strong>Supabase nicht konfiguriert.</strong> Trag{" "}
                    <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
                    <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
                    <code className="font-mono">.env.local</code> ein und starte den Server neu.
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {mode === "magic-sent" ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30"
                    >
                      <CheckCircle2 size={32} className="text-emerald-400" />
                    </motion.div>
                    <p className="text-sm text-zinc-300">
                      Der Link gilt 60 Minuten. Klick ihn, und du bist drin.
                    </p>
                    <button
                      onClick={() => {
                        setMode("magic");
                        setEmail("");
                      }}
                      className="mt-6 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      Andere E-Mail verwenden
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* OAuth row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleOAuth("google")}
                        disabled={envMissing || loading !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <GoogleIcon size={15} /> Google
                      </button>
                      <button
                        onClick={() => handleOAuth("apple")}
                        disabled={envMissing || loading !== null}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <AppleIcon size={15} /> Apple
                      </button>
                    </div>

                    <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-600">
                      <div className="h-px flex-1 bg-white/10" />
                      oder
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* Mode toggle */}
                    <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1">
                      <button
                        type="button"
                        onClick={() => setMode("magic")}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          mode === "magic"
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <Sparkles size={12} /> Magic-Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("password")}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          mode === "password"
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <Lock size={12} /> Passwort
                      </button>
                    </div>

                    {mode === "magic" ? (
                      <form onSubmit={handleMagicLink} className="space-y-3">
                        <label className="block">
                          <span className="block text-xs font-medium text-zinc-400 mb-1.5">
                            E-Mail
                          </span>
                          <div className="relative">
                            <Mail
                              size={15}
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                              type="email"
                              required
                              autoComplete="email"
                              placeholder="du@beispiel.de"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                            />
                          </div>
                        </label>
                        <button
                          type="submit"
                          disabled={envMissing || loading !== null || !email}
                          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === "magic" ? (
                            <>
                              <Loader2 size={15} className="animate-spin" /> Wird gesendet...
                            </>
                          ) : (
                            <>
                              Link senden <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handlePassword} className="space-y-3">
                        <label className="block">
                          <span className="block text-xs font-medium text-zinc-400 mb-1.5">
                            E-Mail
                          </span>
                          <div className="relative">
                            <Mail
                              size={15}
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                              type="email"
                              required
                              autoComplete="email"
                              placeholder="du@beispiel.de"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                            />
                          </div>
                        </label>
                        <label className="block">
                          <span className="block text-xs font-medium text-zinc-400 mb-1.5">
                            Passwort
                          </span>
                          <div className="relative">
                            <Lock
                              size={15}
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                            />
                            <input
                              type="password"
                              required
                              minLength={8}
                              autoComplete={isSignup ? "new-password" : "current-password"}
                              placeholder={isSignup ? "Mind. 8 Zeichen" : "Passwort"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                            />
                          </div>
                        </label>
                        <button
                          type="submit"
                          disabled={envMissing || loading !== null || !email || !password}
                          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === "password" ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />{" "}
                              {isSignup ? "Konto wird erstellt..." : "Anmelden..."}
                            </>
                          ) : (
                            <>
                              {isSignup ? "Konto erstellen" : "Anmelden"}{" "}
                              <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"
                      >
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Toggle signup/login */}
            {mode !== "magic-sent" && (
              <p className="mt-6 text-center text-xs text-zinc-500">
                {isSignup ? "Schon ein Konto?" : "Noch kein Konto?"}{" "}
                <button
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError(null);
                  }}
                  className="font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  {isSignup ? "Jetzt anmelden" : "Konto erstellen"}
                </button>
              </p>
            )}

            <p className="mt-3 text-center text-[10px] text-zinc-600 leading-relaxed max-w-xs mx-auto">
              Mit der Anmeldung akzeptierst du unsere{" "}
              <a href="#" className="underline hover:text-zinc-400">
                Datenschutz&shy;erkl&auml;rung
              </a>{" "}
              und{" "}
              <a href="#" className="underline hover:text-zinc-400">
                Nutzungs&shy;bedingungen
              </a>
              . Hosting in der EU, DSGVO-konform.
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-600" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
