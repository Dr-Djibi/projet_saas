"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Bot, Mail, Loader2, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: "Un code de réinitialisation a été envoyé à votre adresse email.",
        });
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({
          type: "error",
          text: data.message || "Une erreur est survenue lors de l'envoi.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erreur de connexion au serveur." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <div className="w-full max-w-md space-y-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Link href="/" className="p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer">
            <Bot className="h-10 w-10 text-primary" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">Mot de passe</h1>
            <p className="text-foreground/60 font-medium">Récupérez l&apos;accès à votre espace {siteConfig.name}</p>
          </div>
        </div>

        {/* Card Form */}
        <Card className="border-2 border-primary/10 shadow-none rounded-[2.5rem] p-4 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-2xl font-black">Récupération</CardTitle>
            <CardDescription className="text-foreground/50 font-bold uppercase tracking-widest text-[10px]">
              Entrez votre adresse email
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 pr-6 rounded-2xl border-2 border-primary/10 bg-background focus:border-primary focus:ring-0 transition-all font-bold w-full"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-[10px] text-center uppercase font-black text-foreground/40 tracking-widest">
                  Nous vous enverrons un code de réinitialisation à 6 chiffres
                </p>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-xl text-sm font-bold border-2 text-center ${
                    message.type === "success"
                      ? "bg-green-500/10 text-green-700 border-green-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {message.text}
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
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le code"
                )}
              </Button>
            </form>

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
