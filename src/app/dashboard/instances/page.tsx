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
import { Bot } from "lucide-react";
import { InstanceRow } from "@/components/instance-row";

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
                <TableHead className="font-black uppercase text-xs tracking-wider">Port</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider">Heures Restantes</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-foreground/40 font-bold">
                    Aucune instance configurée.
                  </TableCell>
                </TableRow>
              ) : (
                bots.map((bot) => (
                    <InstanceRow key={bot.id} bot={bot} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
