"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

function VerifyForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState("");

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Un nouveau code a été envoyé !");
      } else {
        setError(data.message || "Erreur lors de l'envoi");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login?success=Account verified");
      } else {
        setError(data.message || "Code invalide ou expiré");
        setLoading(false);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-foreground/60 font-medium">
          Nous avons envoyé un code de vérification à :
        </p>
        <p className="font-black text-primary">{email || "votre email"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input 
            placeholder="Entrez le code à 6 chiffres" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            className="h-14 text-center text-2xl font-black tracking-[0.5em] rounded-2xl border-2 border-primary/10 focus:border-primary transition-all"
            maxLength={6}
            required 
          />
          <p className="text-[10px] text-center uppercase font-black text-foreground/40 tracking-widest">
            Vérifiez vos spams si vous ne voyez rien
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-bold text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-green-500/10 border-2 border-green-500/20 text-green-600 text-sm font-bold text-center">
            {success}
          </div>
        )}

        <Button className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer" disabled={loading}>
          {loading ? "Vérification..." : "Confirmer mon compte"}
        </Button>
      </form>
      
      <div className="text-center">
        <button 
          onClick={handleResend} 
          disabled={resending}
          className="text-sm font-bold text-foreground/40 hover:text-primary transition-colors disabled:opacity-50"
        >
          {resending ? "Envoi en cours..." : "Renvoyer le code"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <div className="w-full max-w-md space-y-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">Vérification</h1>
        </div>

        <Card className="border-2 border-primary/10 shadow-none rounded-[2.5rem] p-4 bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <Suspense fallback={<div className="text-center p-10 font-bold">Chargement...</div>}>
              <VerifyForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
