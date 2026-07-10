"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BeamButton } from "@/components/ui/beam-button";
import { useAuth } from "@/lib/auth";
import { Logo } from "./logo";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-dot-grid opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_top,hsl(142_60%_45%/0.08),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-border bg-card shadow-soft">
            <Logo markOnly size={40} animated />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Entrar no Guardian
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Integrity Analysis Tool · Jovens Gênios
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-elevated backdrop-blur-xl">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-muted-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="analista@jovensgenios.com"
                icon={<Mail className="size-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-muted-foreground"
              >
                Senha
              </label>
              <Input
                id="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                icon={<Lock className="size-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {show ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 rounded-lg border border-risk-critical/30 bg-risk-critical/10 px-3 py-2 text-xs text-risk-critical"
              >
                <AlertCircle className="size-3.5 shrink-0" />
                {error}
              </motion.div>
            )}

            <BeamButton type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </BeamButton>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground/70">
            Acesso restrito à equipe de integridade.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground/50">
          © {new Date().getFullYear()} Jovens Gênios · Liga Genial
        </p>
      </motion.div>
    </div>
  );
}
