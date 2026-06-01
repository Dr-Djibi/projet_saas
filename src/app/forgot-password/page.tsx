"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage("Un code a été envoyé à votre adresse email.");
      setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 2000);
    } else {
      setMessage("Erreur lors de l'envoi.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border border-border bg-card">
        <CardTitle className="text-2xl font-black mb-6">Mot de passe oublié</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button className="w-full bg-primary text-black" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le code"}
          </Button>
          {message && <p className="text-sm font-bold text-center mt-4">{message}</p>}
        </form>
      </Card>
    </div>
  );
}
