"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { siteConfig } from "@/config/site";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success")) {
      setError("");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsVerification(false);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        if (res.error.toLowerCase().includes("véri")) {
          setNeedsVerification(true);
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="votre@email.com"
          className="h-14 px-6 rounded-2xl border-2 border-primary/10 bg-white focus:border-primary focus:ring-0 transition-all font-bold"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Mot de passe"
          className="h-14 px-6 rounded-2xl border-2 border-primary/10 bg-white focus:border-primary focus:ring-0 transition-all font-bold"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="text-right">
          <Link href="/forgot-password" hidden className="text-sm font-bold text-primary hover:underline underline-offset-4">
            Mot de passe oublié ?
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-bold text-center space-y-3">
          <p>{error}</p>
          {needsVerification && (
            <Link 
              href={`/signup/verify?email=${encodeURIComponent(email)}`}
              className="block p-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg text-xs transition-colors"
            >
              Aller à la page de vérification →
            </Link>
          )}
        </div>
      )}

      <Button type="submit" className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  
  return (
    <Card className="border-2 border-primary/10 shadow-none rounded-[2.5rem] p-4 bg-white/50 backdrop-blur-sm">
      <CardHeader className="pt-8 pb-4 text-center">
        <CardTitle className="text-2xl font-black">Connexion</CardTitle>
        <CardDescription className="text-foreground/50 font-bold uppercase tracking-widest text-[10px]">Entrez vos identifiants</CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        {searchParams.get("success") && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border-2 border-green-500/20 text-green-600 text-sm font-bold text-center flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {searchParams.get("success") === "Account verified" 
              ? "Compte vérifié avec succès ! Vous pouvez vous connecter." 
              : "Inscription réussie ! Veuillez vérifier votre email."}
          </div>
        )}
        
        <LoginForm />
        
        <div className="mt-8 text-center text-sm font-bold text-foreground/60">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-primary hover:underline underline-offset-4 decoration-2">
            Créer un compte
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <div className="w-full max-w-md space-y-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Link href="/" className="p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer">
            <Bot className="h-10 w-10 text-primary" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">Bon retour !</h1>
            <p className="text-foreground/60 font-medium">Connectez-vous à votre espace {siteConfig.name}</p>
          </div>
        </div>

        <Suspense fallback={<div className="text-center p-10 font-bold">Chargement...</div>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
