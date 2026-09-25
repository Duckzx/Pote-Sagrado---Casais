import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowLeft, Eye, EyeOff, Copy } from "lucide-react";
import { loginWithGoogle, loginWithEmail, signUpWithEmail, resetPassword } from "../firebase";
import { useAppStore } from "../store/useAppStore";
import { ColorBends } from "./ColorBends";
import { SacredJarIcon } from "./SacredJarIcon";
import { ToastContainer } from "./Toast";
import { BlurFade } from "./magicui/blur-fade";
import { ShimmerButton } from "./magicui/shimmer-button";
import { Marquee } from "./magicui/marquee";
import { SparklesText } from "./magicui/sparkles-text";

const FEATURES = [
  "🍯 Pote compartilhado",
  "💞 Modo casal",
  "🫶 Vaquinha com amigos",
  "🌷 Metas só suas",
  "💌 Cápsula do tempo",
  "💐 Mêsversário",
  "🥰 Humor do dia",
  "🏆 Ranking da turma",
  "✨ Missões de economia",
  "📸 Álbum de memórias",
];

type Mode = "choose" | "login" | "signup" | "reset";

const isInAppBrowser = () => /Instagram|FBAN|FBAV|Line\/|TikTok|WhatsApp/i.test(navigator.userAgent);

export const LoginScreen: React.FC = () => {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);
  const addToast = useAppStore((s) => s.addToast);

  const [mode, setMode] = useState<Mode>("choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleBlocked, setGoogleBlocked] = useState(false);

  const handleGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      if (e?.code === "auth/unauthorized-domain") {
        setError("Este endereço ainda não está autorizado no Firebase. Use o e-mail por enquanto.");
      } else {
        if (isInAppBrowser()) setGoogleBlocked(true);
        setError(e?.message || "Não foi possível entrar com o Google.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsBusy(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(name, email, password);
      } else if (mode === "login") {
        await loginWithEmail(email, password);
      } else if (mode === "reset") {
        await resetPassword(email);
        addToast("E-mail enviado 💌", "Confira sua caixa de entrada (e o spam) para criar uma nova senha.", "success");
        setMode("login");
      }
    } catch (err: any) {
      setError(err?.message || "Algo deu errado.");
    } finally {
      setIsBusy(false);
    }
  };

  const title = mode === "signup" ? "Criar conta" : mode === "reset" ? "Recuperar senha" : "Entrar com e-mail";

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ColorBends color="var(--theme-primary)" />

      <div className="relative z-10 w-full max-w-sm mx-auto text-center">
        <BlurFade delay={0.05}>
          <SacredJarIcon className="w-24 h-24 mx-auto animate-float drop-shadow-xl text-cookbook-primary" />
        </BlurFade>
        <BlurFade delay={0.12}>
          <h1 className="font-serif text-[54px] leading-[0.9] text-cookbook-text font-medium tracking-tight mt-5">
            Pote
            <br />
            <SparklesText
              className="text-[54px] font-medium italic text-cookbook-primary inline-block"
              colors={{ first: "#E9C46A", second: "#E28CA0" }}
              sparklesCount={6}
            >
              Sagrado
            </SparklesText>
          </h1>
        </BlurFade>
        <BlurFade delay={0.2}>
          <p className="font-sans text-sm text-cookbook-text/60 mt-4 leading-relaxed">
            Guarde dinheiro para os seus sonhos — sozinha(o), em casal ou com a turma.
          </p>
        </BlurFade>
      </div>

      <BlurFade delay={0.28} className="relative z-10 w-screen mt-6">
        <Marquee pauseOnHover className="[--duration:35s] [--gap:0.5rem]" repeat={3}>
          {FEATURES.map((f) => (
            <span
              key={f}
              className="shrink-0 font-sans text-xs font-semibold text-cookbook-text/70 bg-cookbook-bg/80 backdrop-blur border border-cookbook-border rounded-full px-3 py-1.5"
            >
              {f}
            </span>
          ))}
        </Marquee>
      </BlurFade>

      <div className="relative z-10 w-full max-w-sm mx-auto mt-8">
        <AnimatePresence mode="wait">
          {mode === "choose" ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-3"
            >
              <ShimmerButton
                onClick={handleGoogle}
                background="var(--theme-text)"
                className="w-full py-4 gap-3 font-sans text-xs uppercase tracking-[0.15em] font-bold text-cookbook-bg"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Entrar com Google
              </ShimmerButton>

              <button
                onClick={() => { setMode("signup"); setError(null); }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-cookbook-bg/80 backdrop-blur border border-cookbook-border font-sans text-xs uppercase tracking-[0.15em] font-bold text-cookbook-text active:scale-[0.98] transition-transform"
              >
                <Mail size={15} /> Criar conta com e-mail
              </button>

              <p className="font-sans text-xs text-cookbook-text/60 pt-1">
                Já tem conta com e-mail?{" "}
                <button onClick={() => { setMode("login"); setError(null); }} className="font-bold text-cookbook-primary underline underline-offset-2">
                  Entrar
                </button>
              </p>

              {googleBlocked && (
                <div className="text-left bg-cookbook-bg/80 border border-cookbook-border rounded-2xl p-4 font-sans text-xs text-cookbook-text/80">
                  <p className="font-bold mb-1">Abriu pelo Instagram ou WhatsApp?</p>
                  <p className="mb-3">Esses apps bloqueiam o login do Google. Use o e-mail acima ou abra o site no navegador.</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      addToast("Link copiado!", "Cole no Safari ou Chrome.", "success");
                    }}
                    className="flex items-center gap-2 font-bold text-cookbook-primary"
                  >
                    <Copy size={13} /> Copiar link do site
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-cookbook-bg/85 backdrop-blur-xl border border-cookbook-border rounded-3xl p-5 space-y-3 text-left shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-2 mb-1">
                <button type="button" onClick={() => { setMode("choose"); setError(null); }} className="p-1 -ml-1 text-cookbook-text/50" aria-label="Voltar">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="font-serif text-2xl text-cookbook-text">{title}</h2>
              </div>

              {mode === "signup" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como quer ser chamada(o)?"
                  autoComplete="given-name"
                  required
                  maxLength={60}
                  className="w-full bg-cookbook-bg border border-cookbook-border rounded-2xl px-4 py-3.5 font-sans text-base text-cookbook-text focus:outline-none focus:border-cookbook-primary"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                autoComplete="email"
                inputMode="email"
                required
                className="w-full bg-cookbook-bg border border-cookbook-border rounded-2xl px-4 py-3.5 font-sans text-base text-cookbook-text focus:outline-none focus:border-cookbook-primary"
              />
              {mode !== "reset" && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Crie uma senha (mín. 6)" : "Sua senha"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    minLength={6}
                    required
                    className="w-full bg-cookbook-bg border border-cookbook-border rounded-2xl pl-4 pr-12 py-3.5 font-sans text-base text-cookbook-text focus:outline-none focus:border-cookbook-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cookbook-text/40"
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}

              {error && <p className="font-sans text-xs text-red-500 font-medium">{error}</p>}

              <ShimmerButton
                type="submit"
                disabled={isBusy}
                background="var(--theme-primary)"
                className="w-full py-4 font-sans text-xs uppercase tracking-[0.15em] font-bold disabled:opacity-50"
              >
                {isBusy ? "Aguarde..." : mode === "signup" ? "Criar minha conta" : mode === "reset" ? "Enviar link" : "Entrar"}
              </ShimmerButton>

              <div className="flex justify-between font-sans text-xs text-cookbook-text/60 pt-1">
                {mode === "login" ? (
                  <>
                    <button type="button" onClick={() => { setMode("reset"); setError(null); }} className="underline underline-offset-2">
                      Esqueci a senha
                    </button>
                    <button type="button" onClick={() => { setMode("signup"); setError(null); }} className="font-bold text-cookbook-primary">
                      Criar conta
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setMode("login"); setError(null); }} className="font-bold text-cookbook-primary">
                    Já tenho conta
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {error && mode === "choose" && (
          <p className="font-sans text-xs text-red-500 font-medium text-center mt-3">{error}</p>
        )}

        <p className="font-sans text-[10px] text-cookbook-text/40 text-center mt-6 leading-relaxed">
          Ao continuar você concorda com os{" "}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-legal", { detail: "termos" }))}
            className="underline underline-offset-2"
          >
            Termos e a Política de Privacidade
          </button>
          .
        </p>
      </div>
    </div>
  );
};
