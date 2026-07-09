"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Bot, Key, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";

function ResetPasswordForm() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      if (res.ok) {
        router.push("/login?success=Password updated");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Erreur lors de la réinitialisation.");
        setLoading(false);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {/* Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">
            Code de validation
          </label>
          <Input
            placeholder="Entrez le code à 6 chiffres"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-14 text-center text-xl font-black tracking-[0.2em] rounded-2xl border-2 border-primary/10 bg-background focus:border-primary focus:ring-0 transition-all"
            maxLength={6}
            required
            disabled={loading}
          />
        </div>

        {/* Password input with show/hide */}
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 pl-6 pr-14 rounded-2xl border-2 border-primary/10 bg-background focus:border-primary focus:ring-0 transition-all font-bold w-full"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors cursor-pointer focus:outline-none"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-bold text-center">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Réinitialisation...
          </>
        ) : (
          "Mettre à jour le mot de passe"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <div className="w-full max-w-md space-y-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">Sécurité</h1>
            <p className="text-foreground/60 font-medium">Définissez votre nouveau mot de passe</p>
          </div>
        </div>

        {/* Card Form */}
        <Card className="border-2 border-primary/10 shadow-none rounded-[2.5rem] p-4 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-2xl font-black">Nouveau mot de passe</CardTitle>
            <CardDescription className="text-foreground/50 font-bold uppercase tracking-widest text-[10px]">
              Saisissez les informations de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Suspense fallback={<div className="text-center p-10 font-bold">Chargement...</div>}>
              <ResetPasswordForm />
            </Suspense>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
