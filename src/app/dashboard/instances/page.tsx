import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsappBot } from "@/lib/models";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Bot, Power, Play, FileText, Activity } from "lucide-react";
import { InstanceActions } from "@/components/instance-actions";

export default async function InstancesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;
  const bots = await WhatsappBot.findAll({
    where: { userId },
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-foreground">Mes Instances</h2>
        <p className="text-foreground/60 font-medium">Gérez vos instances de bot WhatsApp et surveillez leur état en temps réel.</p>
      </div>

      <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden">
        <CardHeader className="border-b-2 border-primary/5 bg-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Liste des Instances
            </CardTitle>
            {!bots.length && (
              <form action="/api/bots/provision" method="POST">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-black border-b-4 border-black/20 active:border-b-0 active:translate-y-[2px] transition-all cursor-pointer">
                  Nouvelle Instance
                </Button>
              </form>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-black uppercase text-xs tracking-wider px-6">Nom / Process PM2</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider">Statut</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider">Heures Restantes</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-foreground/40 font-bold">
                    Aucune instance configurée.
                  </TableCell>
                </TableRow>
              ) : (
                bots.map((bot) => (
                  <TableRow key={bot.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-foreground">{bot.botName || "Menma Bot"}</span>
                        <span className="text-xs font-mono text-foreground/40">{bot.pm2ProcessName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${bot.isActive ? "bg-green-500 animate-pulse" : "bg-orange-500"}`} />
                        <span className="text-sm font-black uppercase tracking-tight">
                          {bot.isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {bot.remainingHours.toFixed(2)}h
                      </span>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-9 px-3 border-2 border-primary/20 hover:border-primary/40 text-primary font-black cursor-pointer">
                          <FileText className="h-4 w-4 mr-1" /> Logs
                        </Button>
                        <InstanceActions botId={bot.id} isActive={bot.isActive} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
