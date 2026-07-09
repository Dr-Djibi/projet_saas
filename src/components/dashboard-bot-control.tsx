"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Bot,
  Power,
  RefreshCw,
  Settings,
  Activity,
  Signal,
  Play,
  Trash2,
  FileText,
  QrCode,
  ExternalLink,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  HelpCircle,
  KeyRound
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardBotControlProps {
  initialBot: any | null;
  userId: string;
}

export function DashboardBotControl({ initialBot, userId }: DashboardBotControlProps) {
  const router = useRouter();
  const [bot, setBot] = useState(initialBot);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [provisionStep, setProvisionStep] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [connectionUrl, setConnectionUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState("");
  const [logsOpen, setLogsOpen] = useState(false);

  // States for manual session ID
  const [manualSessionOpen, setManualSessionOpen] = useState(false);
  const [manualSessionId, setManualSessionId] = useState("");
  const [manualSessionLoading, setManualSessionLoading] = useState(false);

  // Auto-refresh logs when panel is open
  useEffect(() => {
    if (!logsOpen) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/bots/logs?type=out`);
        const data = await res.json();
        setLogs(data.logs || "Pas de logs disponibles.");
      } catch (error) {
        setLogs("Impossible de récupérer les logs.");
      }
    };

    // Premier chargement immédiat
    fetchLogs();

    // Polling toutes les 3 secondes
    const interval = setInterval(fetchLogs, 3000);

    return () => clearInterval(interval);
  }, [logsOpen]);

  // Polling du statut global du bot toutes les 15 secondes
  useEffect(() => {
    if (!bot) return;

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/bots/status");
        if (res.ok) {
          const data = await res.json();
          setBot((prev: any) => prev ? {
            ...prev,
            liveStatus: data.liveStatus,
            isActive: data.isActive,
            remainingHours: data.remainingHours,
            status: data.status
          } : null);
        }
      } catch (err) {
        console.error("Failed to check status:", err);
      }
    };

    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [bot?.id]);

  // Form states for provisioning
  const [botType, setBotType] = useState<"menma" | "ovl">("menma");
  const [botName, setBotName] = useState("Menma Bot");
  const [prefix, setPrefix] = useState(".");
  const [ownerNumber, setOwnerNumber] = useState("");

  // Handle bot provisioning
  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionLoading(true);
    try {
      const res = await fetch("/api/bots/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botType, botName, prefix, ownerNumber }),
      });

      const data = await res.json();
      if (res.ok) {
        setBot(data.bot);
        router.refresh();
      } else {
        alert(data.message || "Erreur lors de la création de l'instance.");
      }
    } catch (error) {
      alert("Une erreur est survenue lors du provisionnement.");
    } finally {
      setProvisionLoading(false);
    }
  };

  // Handle starting the session server for QR/Pairing
  const handleStartSession = async () => {
    setSessionLoading(true);
    setConnectionUrl(null);
    try {
      const res = await fetch("/api/bots/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setConnectionUrl(data.connectionUrl);
        // Automatically open the connection URL in a new tab
        window.open(data.connectionUrl, "_blank");
      } else {
        alert(data.message || "Erreur lors du démarrage du site d'association.");
      }
    } catch (error) {
      alert("Une erreur réseau est survenue.");
    } finally {
      setSessionLoading(false);
    }
  };

  // Handle manual session ID submission
  const handleManualSession = async () => {
    if (!manualSessionId.trim()) return alert("Veuillez entrer un Session ID valide.");
    
    setManualSessionLoading(true);
    try {
      const res = await fetch("/api/bots/session/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: manualSessionId.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Session configurée avec succès ! Le bot démarre.");
        setManualSessionOpen(false);
        setManualSessionId("");
        
        // Refresh bot status locally to show it's paired
        setBot((prev: any) => prev ? { ...prev, isActive: true, liveStatus: "online" } : prev);
        router.refresh();
      } else {
        alert(data.message || "Erreur lors de l'enregistrement de la session.");
      }
    } catch (error) {
      alert("Une erreur est survenue.");
    } finally {
      setManualSessionLoading(false);
    }
  };

  // Handle action start / stop / delete
  const handleAction = async (action: "start" | "stop" | "delete") => {
    if (action === "delete" && !confirm("Êtes-vous sûr de vouloir supprimer définitivement cette instance ? Cette action effacera également tous vos fichiers de session.")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/bots/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, botId: bot.id }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === "delete") {
          setBot(null);
          setConnectionUrl(null);
        } else {
          setBot(data.bot);
        }
        router.refresh();
      } else {
        alert(data.message || "Erreur lors de l'action");
      }
    } catch (error) {
      alert("Erreur lors de l'exécution de l'action");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch logs (simplifié car géré par le useEffect)
  const handleViewLogs = () => {
    setLogsOpen(true);
    setLogs("Chargement des logs en temps réel...");
  };

  // 1. CREATION WIZARD STATE
  if (!bot) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-2">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Configuration de l&apos;Instance</h2>
          <p className="text-foreground/60 font-medium max-w-md mx-auto">
            Configurez et déployez votre propre bot WhatsApp hébergé sur notre serveur en moins d&apos;une minute.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground/40">
          <span className={provisionStep === 1 ? "text-primary" : ""}>1. Modèle</span>
          <ChevronRight className="h-4 w-4" />
          <span className={provisionStep === 2 ? "text-primary" : ""}>2. Paramètres</span>
          <ChevronRight className="h-4 w-4" />
          <span className={provisionStep === 3 ? "text-primary" : ""}>3. Déploiement</span>
        </div>

        <Card className="border-2 border-primary/10 shadow-xl shadow-primary/2 rounded-3xl overflow-hidden bg-card">
          <CardHeader className="border-b-2 border-primary/5 bg-primary/5 p-6">
            <CardTitle className="text-xl font-black">
              {provisionStep === 1 ? "Choisissez le modèle de bot" : "Informations de configuration"}
            </CardTitle>
            <CardDescription className="font-bold">
              {provisionStep === 1
                ? "Sélectionnez le code source à déployer sur votre serveur."
                : "Ces valeurs seront injectées automatiquement dans le fichier .env du bot."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {provisionStep === 1 ? (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div
                    onClick={() => setBotType("menma")}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col gap-3 group relative overflow-hidden ${botType === "menma"
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-primary/10 bg-card hover:border-primary/30"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-lg text-foreground">Menma-MD</span>
                      <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-primary/20 text-primary">Recommandé</span>
                    </div>
                    <p className="text-sm font-medium text-foreground/60">
                      Modèle de bot ultra complet, intègre la gestion avancée des médias, les commandes d&apos;administration de groupe et des intégrations IA.
                    </p>
                    <div className="text-xs font-black text-primary/80 mt-2">Plus de 200+ commandes</div>
                  </div>

                  <div
                    onClick={() => setBotType("ovl")}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col gap-3 group relative overflow-hidden ${botType === "ovl"
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-primary/10 bg-card hover:border-primary/30"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-lg text-foreground">Ovl-MD</span>
                      <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-foreground/10 text-foreground/70">Léger</span>
                    </div>
                    <p className="text-sm font-medium text-foreground/60">
                      Une alternative minimaliste optimisée pour la rapidité et la faible consommation de mémoire RAM. Idéal pour les configurations basiques.
                    </p>
                    <div className="text-xs font-black text-foreground/50 mt-2">Démarrage en 3 secondes</div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setProvisionStep(2)}
                    className="px-8 h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px]"
                  >
                    Continuer <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProvision} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">Nom du Bot</label>
                  <Input
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="h-12 border-2 border-primary/10 rounded-xl font-bold focus-visible:ring-primary"
                    placeholder="Ex: Menma WhatsApp"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">Préfixe</label>
                    <Input
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="h-12 border-2 border-primary/10 rounded-xl font-bold focus-visible:ring-primary"
                      placeholder="Ex: ."
                      maxLength={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">Numéro Propriétaire (JID)</label>
                    <Input
                      value={ownerNumber}
                      onChange={(e) => setOwnerNumber(e.target.value)}
                      className="h-12 border-2 border-primary/10 rounded-xl font-bold focus-visible:ring-primary"
                      placeholder="Ex: 2250708091011"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-primary/5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setProvisionStep(1)}
                    className="h-12 font-black text-foreground/60 hover:text-foreground cursor-pointer"
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    disabled={provisionLoading}
                    className="px-8 h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer gap-2"
                  >
                    {provisionLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Déploiement en cours...
                      </>
                    ) : (
                      <>
                        Créer mon instance
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine actual connection state based on DB properties
  const isPaired = bot.isActive || bot.whatsappNumber;

  // 2. CONFIGURED BOT CONTROL & STATUS STATE
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">{bot.botName || "Mon Bot"}</h2>
            <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {bot.botType === "menma" ? "Menma-MD" : "Ovl-MD"}
            </span>
          </div>
          <p className="text-sm text-foreground/60 font-medium break-all">
            Port : <span className="font-mono bg-primary/5 px-2 py-0.5 rounded text-primary">{bot.port || "Non attribué"}</span> | PM2 : <span className="font-mono text-xs">{bot.pm2ProcessName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleViewLogs}
            variant="outline"
            className="h-11 sm:h-12 border-2 border-primary/10 hover:border-primary/30 font-black rounded-xl gap-2 cursor-pointer"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Voir les </span>Logs
          </Button>

          <Button
            onClick={() => handleAction("delete")}
            variant="ghost"
            disabled={actionLoading}
            className="h-11 sm:h-12 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive font-black rounded-xl cursor-pointer"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* WARNING banner if credentials/pairing is not set up */}
      {!isPaired && (
        <Card className="border-2 border-orange-500/20 bg-orange-500/5 shadow-none rounded-3xl overflow-hidden animate-pulse-subtle">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-600">
                <QrCode className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-lg text-orange-800">Association WhatsApp Requise</h4>
                <p className="text-sm font-bold text-orange-700/80 max-w-lg">
                  Votre instance est provisionnée mais elle n&apos;est liée à aucun compte WhatsApp. Associez votre compte pour commencer.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={handleStartSession}
                disabled={sessionLoading}
                className="h-12 px-6 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer gap-2"
              >
                {sessionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Démarrage...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5" />
                    Associer WhatsApp
                  </>
                )}
              </Button>
              <Button
                onClick={() => setManualSessionOpen(true)}
                variant="outline"
                className="h-12 px-6 font-black rounded-xl border-orange-500/20 text-orange-700 hover:bg-orange-500/10 cursor-pointer gap-2"
              >
                <KeyRound className="h-5 w-5" />
                J'ai déjà un Session ID
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {connectionUrl && (
        <Card className="border-2 border-green-500/20 bg-green-500/5 shadow-none rounded-3xl">
          <CardContent className="p-5 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-green-700 font-black">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              Session d&apos;association démarrée !
            </div>
            <p className="text-sm font-medium text-foreground/70 max-w-2xl">
              Le serveur de connexion a été lancé avec succès. Cliquez sur le bouton ci-dessous pour ouvrir la page d&apos;appairage, où vous pourrez scanner le code QR ou obtenir un code de liaison.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <Button
                onClick={() => window.open(connectionUrl, "_blank")}
                className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] cursor-pointer gap-2 shrink-0"
              >
                Ouvrir la page de connexion <ExternalLink className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold text-foreground/40 font-mono break-all select-all">
                {connectionUrl}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid status cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mx-auto max-w-6xl w-full">
        {/* Status Card */}
        <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden group hover:border-primary/30 transition-all bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b-2 border-primary/5 bg-primary/5">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Statut du Bot</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-8 flex flex-col items-center justify-center">
            <div className="flex items-center gap-3">
              <div className={`h-4.5 w-4.5 rounded-full ${bot.liveStatus === "online" || (!bot.liveStatus && bot.isActive)
                ? "bg-green-500 animate-pulse"
                : bot.liveStatus === "errored"
                  ? "bg-red-500 animate-pulse"
                  : "bg-orange-500"
                }`} />
              <div className="text-4xl font-black">
                {bot.liveStatus === "online" || (!bot.liveStatus && bot.isActive)
                  ? "Actif"
                  : bot.liveStatus === "errored"
                    ? "Erreur"
                    : "Inactif"}
              </div>
            </div>
            <p className="mt-4 text-xs font-bold text-foreground/40 text-center">
              {bot.liveStatus === "online" || (!bot.liveStatus && bot.isActive)
                ? "L'instance PM2 tourne sur le serveur"
                : bot.liveStatus === "errored"
                  ? "Le processus a rencontré une erreur"
                  : "L'instance est actuellement arrêtée"}
            </p>
          </CardContent>
        </Card>

        {/* Uptime / Credit Card */}
        <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden group hover:border-primary/30 transition-all bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b-2 border-primary/5 bg-primary/5">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Abonnement</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-8 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-primary">{bot.remainingHours.toFixed(1)}</span>
              <span className="text-lg font-black text-foreground/40">heures</span>
            </div>
            <p className="mt-4 text-xs font-black text-foreground/50 bg-primary/10 px-3 py-1 rounded-full">
              Statut facturation : {bot.status === "active" ? "Actif" : bot.status === "paused" ? "Suspendu" : "Expiré"}
            </p>
          </CardContent>
        </Card>

        {/* Commands / Operations */}
        <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden group hover:border-primary/30 transition-all bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b-2 border-primary/5 bg-primary/5">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Opérations PM2</CardTitle>
            <Signal className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-8 flex flex-col gap-4">
            {(bot.liveStatus === "online" || (!bot.liveStatus && bot.isActive)) ? (
              <Button
                onClick={() => handleAction("stop")}
                disabled={actionLoading}
                className="w-full h-12 font-black border-2 border-destructive text-destructive hover:bg-destructive/5 rounded-xl cursor-pointer gap-2 transition-all"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Arrêt...
                  </>
                ) : (
                  <>
                    <Power className="h-5 w-5" />
                    Arrêter le bot
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => handleAction("start")}
                disabled={actionLoading || bot.remainingHours <= 0 || !isPaired}
                className="w-full h-12 font-black bg-green-600 hover:bg-green-700 text-white rounded-xl border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] cursor-pointer gap-2 transition-all disabled:opacity-55"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Démarrage...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Démarrer le bot
                  </>
                )}
              </Button>
            )}

            {isPaired && (
              <>
                <Button
                  onClick={handleStartSession}
                  disabled={sessionLoading}
                  variant="outline"
                  className="w-full h-12 font-black border-2 border-primary/10 hover:border-primary/30 rounded-xl cursor-pointer gap-2 transition-all"
                >
                  {sessionLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Démarrage...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      Associer un autre numéro
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setManualSessionOpen(true)}
                  variant="outline"
                  className="w-full h-12 font-black border-2 border-primary/10 hover:border-primary/30 rounded-xl cursor-pointer gap-2 transition-all"
                >
                  <KeyRound className="h-5 w-5" />
                  Saisir un Session ID Manuel
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration Quick Info */}
      <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden bg-card/20">
        <CardHeader className="border-b border-primary/5">
          <CardTitle className="text-lg font-black">Informations de Configuration</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-1">
              <span className="text-xs font-black text-foreground/40 uppercase">Préfixe</span>
              <p className="font-bold text-lg font-mono">{bot.prefix || "."}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black text-foreground/40 uppercase">Propriétaire</span>
              <p className="font-bold text-base sm:text-lg font-mono break-all">{bot.ownerNumber || "Non défini"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black text-foreground/40 uppercase">Modèle</span>
              <p className="font-bold text-lg uppercase">{bot.botType}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black text-foreground/40 uppercase">Abonnement</span>
              <p className="font-bold text-lg">{bot.remainingHours > 0 ? "Valide" : "Expiré"}</p>
            </div>
          </div>
          <div className="pt-2 text-right">
            <Button
              onClick={() => router.push("/dashboard/settings")}
              variant="link"
              className="font-black text-primary text-sm p-0 h-auto cursor-pointer"
            >
              Modifier la configuration dans les Paramètres →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs View Sheet */}
      <Sheet open={logsOpen} onOpenChange={setLogsOpen}>
        <SheetContent className="w-full sm:w-[600px] md:w-[850px] p-4 sm:p-6 flex flex-col h-full bg-black border-l-2 border-zinc-800">
          <SheetHeader className="border-b border-zinc-800 pb-4">
            <SheetTitle className="text-white font-black text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Terminal de logs - {bot.botName}
            </SheetTitle>
            <SheetDescription className="text-zinc-400 font-medium">
              Les 200 dernières lignes de sortie du processus PM2 de votre instance de bot.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 mt-6 p-4 bg-zinc-950 text-green-400 font-mono text-xs rounded-2xl border border-zinc-800 overflow-auto whitespace-pre-wrap flex flex-col-reverse justify-end">
            <div>{logs}</div>
          </div>
          <div className="mt-4 flex justify-between border-t border-zinc-800 pt-4">
            <Button
              onClick={handleViewLogs}
              className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px]"
            >
              Rafraîchir
            </Button>
            <Button
              variant="outline"
              onClick={() => setLogsOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl font-black"
            >
              Fermer
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Manual Session ID Modal */}
      <Sheet open={manualSessionOpen} onOpenChange={setManualSessionOpen}>
        <SheetContent side="bottom" className="w-full max-w-2xl mx-auto rounded-t-3xl border-t-2 border-primary/20 bg-background sm:p-8">
          <SheetHeader className="text-left space-y-2 pb-6 border-b border-primary/10">
            <SheetTitle className="text-2xl font-black flex items-center gap-2 text-foreground">
              <KeyRound className="h-6 w-6 text-primary" />
              Entrer un Session ID
            </SheetTitle>
            <SheetDescription className="text-foreground/70 font-medium">
              Si vous avez déjà généré un Session ID ailleurs, collez-le ici pour l'associer directement à ce bot.
            </SheetDescription>
          </SheetHeader>
          <div className="py-8 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">Clé de Session (Session ID)</label>
              <Input
                value={manualSessionId}
                onChange={(e) => setManualSessionId(e.target.value)}
                placeholder="Ex: Menma_md_abc123_SESSION_ID"
                className="h-14 text-base border-2 border-primary/20 rounded-xl font-mono focus-visible:ring-primary shadow-inner bg-primary/5"
              />
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 text-xs font-bold flex items-start gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Une fois le Session ID soumis, le serveur va redémarrer votre bot et injecter cette clé directement dans ses paramètres. Si la clé est valide, le bot s'activera.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
            <Button
              variant="ghost"
              onClick={() => setManualSessionOpen(false)}
              className="font-black h-12 px-6"
            >
              Annuler
            </Button>
            <Button
              onClick={handleManualSession}
              disabled={manualSessionLoading || !manualSessionId.trim()}
              className="bg-primary hover:bg-primary/90 text-white font-black h-12 px-8 rounded-xl border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all"
            >
              {manualSessionLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sauvegarder et Démarrer"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
