"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function RedeemTicketForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const code = (e.currentTarget.elements.namedItem("code") as HTMLInputElement).value;
    
    try {
      const res = await fetch("/api/billing/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'utilisation du ticket");
      }
    } catch (error) {
      alert("Erreur lors de l'utilisation du ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">Utiliser un Ticket</label>
        <div className="flex gap-2">
          <Input 
            name="code"
            id="code" 
            placeholder="XXXX-XXXX-XXXX" 
            className="h-12 border-2 border-primary/10 rounded-xl focus-visible:ring-primary font-mono font-bold"
            required
          />
          <Button type="submit" disabled={loading} className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-black border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer">
            {loading ? "..." : "Valider"}
          </Button>
        </div>
      </div>
      <p className="text-xs font-bold text-foreground/40 text-center md:text-left">
        Les tickets ajoutent instantanément des heures à votre instance active.
      </p>
    </form>
  );
}
