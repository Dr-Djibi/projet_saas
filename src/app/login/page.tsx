"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email ou mot de passe incorrect");
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-20">
      <div className="w-full max-w-md space-y-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Link href="/" className="p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer">
            <Bot className="h-10 w-10 text-primary" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">Bon retour !</h1>
            <p className="text-foreground/60 font-medium">Connectez-vous à votre espace Menma VPS</p>
          </div>
        </div>
        
        <Card className="border-2 border-primary/10 shadow-none rounded-[2.5rem] p-4 bg-white/50 backdrop-blur-sm">
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-2xl font-black">Connexion</CardTitle>
            <CardDescription className="text-foreground/50 font-bold uppercase tracking-widest text-[10px]">Entrez vos identifiants</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            {searchParams.get("success") && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border-2 border-green-100 text-green-700 text-sm font-bold text-center">
                Compte créé avec succès. Vous pouvez vous connecter.
              </div>
            )}
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
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-bold text-center">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
            <div className="mt-8 text-center text-sm font-bold text-foreground/60">
              Pas encore de compte ?{" "}
              <Link href="/signup" className="text-primary hover:underline underline-offset-4 decoration-2">
                Créer un compte
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
