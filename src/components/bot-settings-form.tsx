"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Save, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BotSettingsFormProps {
  initialBot: {
    id: string;
    botName: string;
    botType: "menma" | "ovl";
    prefix: string;
    ownerNumber: string | null;
  } | null;
}

export function BotSettingsForm({ initialBot }: BotSettingsFormProps) {
  const [botName, setBotName] = useState(initialBot?.botName || "Menma Bot");
  const [botType, setBotType] = useState<"menma" | "ovl">(initialBot?.botType || "menma");
  const [prefix, setPrefix] = useState(initialBot?.prefix || ".");
  const [ownerNumber, setOwnerNumber] = useState(initialBot?.ownerNumber || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  if (!initialBot) {
    return (
      <div className="p-6 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 text-center">
        <Bot className="h-10 w-10 text-primary/60 mx-auto mb-3" />
        <h4 className="font-black text-lg mb-1">Aucun bot configuré</h4>
        <p className="text-sm font-medium text-foreground/60 mb-4">
          Vous devez d&apos;abord créer une instance de bot depuis votre tableau de bord.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="font-black bg-primary text-black hover:bg-primary/95">
          Créer une instance
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/bots/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botName,
          botType,
          prefix,
          ownerNumber,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Paramètres mis à jour avec succès !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de la mise à jour" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Une erreur réseau est survenue." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-bold border-2 ${
            message.type === "success"
              ? "bg-green-500/10 text-green-700 border-green-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Nom du Bot */}
      <div className="space-y-2">
        <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">
          Nom du Bot
        </label>
        <Input
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
          className="h-12 border-2 border-primary/10 rounded-xl font-bold focus-visible:ring-primary"
          placeholder="Ex: Mon Super Bot"
          required
        />
      </div>

      {/* Modèle de Bot */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 ml-1">
          <label className="text-sm font-black uppercase tracking-wider text-foreground/60">
            Type de Bot (Modèle)
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-foreground/40 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="font-bold text-xs">
                  Changer le modèle réinitialise et clone le nouveau code. Menma-MD propose plus de fonctionnalités tandis que Ovl-MD est plus léger.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setBotType("menma")}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
              botType === "menma"
                ? "border-primary bg-primary/5 text-primary"
                : "border-primary/10 bg-card hover:border-primary/30"
            }`}
          >
            <span className="font-black text-sm text-foreground">Menma-MD</span>
            <span className="text-[10px] font-bold text-foreground/50">Complet + Dashboard Admin</span>
          </div>
          <div
            onClick={() => setBotType("ovl")}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
              botType === "ovl"
                ? "border-primary bg-primary/5 text-primary"
                : "border-primary/10 bg-card hover:border-primary/30"
            }`}
          >
            <span className="font-black text-sm text-foreground">Ovl-MD</span>
            <span className="text-[10px] font-bold text-foreground/50">Ultra-rapide, optimisé ressources</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Préfixe des Commandes */}
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">
            Préfixe
          </label>
          <Input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="h-12 border-2 border-primary/10 rounded-xl font-bold focus-visible:ring-primary"
            placeholder="Ex: ."
            maxLength={3}
            required
          />
        </div>

        {/* Numéro du Propriétaire */}
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">
            Numéro Propriétaire (JID)
          </label>
          <Input
            value={ownerNumber}
            onChange={(e) => setOwnerNumber(e.target.value)}
            className="h-12 border-2 border-primary/10 rounded-xl font-bold focus-visible:ring-primary"
            placeholder="Ex: 2250708091011"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer gap-2"
      >
        <Save className="h-5 w-5" />
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </Button>
    </form>
  );
}
