import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Bot, Power, RefreshCw, Settings, Activity, Signal } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const bot = await prisma.whatsappBot.findUnique({
    where: { userId },
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-foreground">Mon Instance Bot</h2>
        <p className="text-foreground/60 font-medium">Gérez votre bot Menma-MD et surveillez son activité.</p>
      </div>

      {!bot ? (
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5 shadow-none rounded-3xl p-10 flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-primary/10 mb-6">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-black">Configuration initiale</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="mb-8 text-foreground/60 font-medium max-w-md">
              Vous n&apos;avez pas encore d&apos;instance bot configurée. Créez-en une maintenant pour commencer à automatiser vos messages.
            </p>
            <form action="/api/bots/provision" method="POST">
              <Button type="submit" size="lg" className="px-10 h-14 text-lg font-black bg-primary hover:bg-primary/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer">
                Créer mon instance
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Statut Card */}
          <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b-2 border-primary/5 bg-primary/5">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Statut Global</CardTitle>
              <Activity className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="pt-8 flex flex-col items-center">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded-full ${bot.isActive ? "bg-green-500 animate-pulse" : "bg-orange-500"}`} />
                <div className="text-4xl font-black">
                  {bot.isActive ? "Connecté" : "Déconnecté"}
                </div>
              </div>
              <p className="mt-4 text-sm font-bold text-foreground/40">Mis à jour il y a quelques secondes</p>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b-2 border-primary/5 bg-primary/5">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Actions Rapides</CardTitle>
              <Signal className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="pt-8 flex flex-col gap-4">
              <Button className="w-full h-12 font-black bg-primary hover:bg-primary/90 text-white border-b-4 border-black/20 active:border-b-0 active:translate-y-[1px] transition-all cursor-pointer gap-2">
                <RefreshCw className="h-5 w-5" />
                Reconnecter l&apos;instance
              </Button>
              <Button variant="outline" className="w-full h-12 font-black border-2 border-destructive text-destructive hover:bg-destructive/5 transition-all cursor-pointer gap-2">
                <Power className="h-5 w-5" />
                Arrêter le service
              </Button>
            </CardContent>
          </Card>

          {/* Instance Details Card */}
          <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden group hover:border-primary/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b-2 border-primary/5 bg-primary/5">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-primary">Informations</CardTitle>
              <Settings className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="pt-8 space-y-4">
              <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                <span className="text-sm font-bold text-foreground/50">ID Instance</span>
                <span className="text-sm font-black font-mono bg-primary/5 px-2 py-1 rounded-md">{bot.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                <span className="text-sm font-bold text-foreground/50">Plan</span>
                <span className="text-sm font-black text-accent">Standard</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground/50">Uptime</span>
                <span className="text-sm font-black">99.9%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
