"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Eye, EyeOff } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username: name }),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        console.log("Redirecting to verify...");
        router.push(`/signup/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.message || "Une erreur est survenue");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Erreur de connexion");
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
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">Bienvenue !</h1>
            <p className="text-foreground/60 font-medium">Rejoignez {siteConfig.name} aujourd&apos;hui</p>
          </div>
        </div>
        
        <Card className="border-2 border-primary/10 shadow-none rounded-[2.5rem] p-4 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-2xl font-black">Inscription</CardTitle>
            <CardDescription className="text-foreground/50 font-bold uppercase tracking-widest text-[10px]">Entrez vos informations</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 px-6 rounded-2xl border-2 border-primary/10 bg-background focus:border-primary focus:ring-0 transition-all font-bold"
                required
              />
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 px-6 rounded-2xl border-2 border-primary/10 bg-background focus:border-primary focus:ring-0 transition-all font-bold"
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-6 pr-12 rounded-2xl border-2 border-primary/10 bg-background focus:border-primary focus:ring-0 transition-all font-bold w-full"
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 top-[18px] text-gray-500 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmer mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 pl-6 pr-12 rounded-2xl border-2 border-primary/10 bg-background focus:border-primary focus:ring-0 transition-all font-bold w-full"
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 top-[18px] text-gray-500 hover:text-primary transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-bold text-center">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer" disabled={loading}>
                {loading ? "Création..." : "S'inscrire"}
              </Button>
            </form>
            <div className="mt-8 text-center text-sm font-bold text-foreground/60">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline underline-offset-4">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
