"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";

function ResetPasswordForm() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    });

    if (res.ok) {
      router.push("/login?success=Password updated");
    } else {
      alert("Erreur de réinitialisation");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Code reçu par email" value={code} onChange={(e) => setCode(e.target.value)} required />
      <Input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button className="w-full bg-primary text-black" disabled={loading}>
        {loading ? "Mise à jour..." : "Réinitialiser"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border border-border bg-card">
        <CardTitle className="text-2xl font-black mb-6">Nouveau mot de passe</CardTitle>
        <Suspense fallback={<div className="text-center p-4 font-bold">Chargement...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}
