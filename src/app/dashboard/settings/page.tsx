import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, WhatsappBot } from "@/lib/models";
import { User as UserIcon, Mail, ShieldCheck, ShieldAlert, Key, Smartphone } from "lucide-react";
import { BotSettingsForm } from "@/components/bot-settings-form";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const user = await User.findByPk(userId) as any;

  const bot = await WhatsappBot.findOne({ where: { userId } }) as any;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-foreground">Paramètres</h2>
        <p className="text-foreground/60 font-medium">Gérez vos informations personnelles et la sécurité de votre compte.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="border-b-2 border-primary/5 bg-primary/5">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-primary" />
              Profil Utilisateur
            </CardTitle>
            <CardDescription className="font-bold">Vos informations de base.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">Nom d&apos;utilisateur</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
                <Input 
                  defaultValue={user.username} 
                  className="h-12 pl-12 border-2 border-primary/10 rounded-xl font-bold bg-muted/50" 
                  disabled 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-wider text-foreground/60 ml-1">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
                <Input 
                  defaultValue={user.email} 
                  className="h-12 pl-12 border-2 border-primary/10 rounded-xl font-bold bg-muted/50" 
                  disabled 
                />
              </div>
            </div>
            <div className="pt-2">
              <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${user.isVerified ? 'border-green-500/20 bg-green-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
                {user.isVerified ? (
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-orange-600" />
                )}
                <div>
                  <p className={`font-black ${user.isVerified ? 'text-green-700' : 'text-orange-700'}`}>
                    {user.isVerified ? 'Compte Vérifié' : 'Compte non vérifié'}
                  </p>
                  <p className="text-xs font-bold opacity-70">
                    {user.isVerified ? 'Votre compte est sécurisé et validé.' : 'Veuillez vérifier votre email pour activer toutes les fonctionnalités.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Bot Settings */}
        <div className="space-y-8">
          <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-primary/5 bg-primary/5">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                Configuration du Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <BotSettingsForm initialBot={bot ? {
                id: bot.id,
                botName: bot.botName,
                botType: bot.botType,
                prefix: bot.prefix,
                ownerNumber: bot.ownerNumber
              } : null} />
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-primary/5 bg-primary/5">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Key className="h-6 w-6 text-primary" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm font-bold text-foreground/60">
                Vous pouvez modifier votre mot de passe à tout moment pour assurer la sécurité de votre compte.
              </p>
              <Button variant="outline" className="w-full h-12 border-2 border-primary/10 hover:border-primary/30 font-black rounded-xl cursor-pointer">
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
