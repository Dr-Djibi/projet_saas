import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WhatsappBot, PaymentTransaction } from "@/lib/models";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Wallet, CreditCard, History, Ticket, ArrowUpRight } from "lucide-react";
import { RedeemTicketForm } from "@/components/redeem-ticket-form";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const bot = await WhatsappBot.findOne({
    where: { userId },
  }) as any;

  const transactions = await PaymentTransaction.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 10
  }) as any[];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-foreground">Facturation & Crédits</h2>
        <p className="text-foreground/60 font-medium">Gérez vos crédits de temps et consultez l&apos;historique de vos transactions.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Balance Card */}
        <Card className="lg:col-span-2 border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="border-b-2 border-primary/5 bg-primary/5">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Solde Actuel
            </CardTitle>
            <CardDescription className="font-bold">Crédits de temps restants pour votre instance.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-sm font-black uppercase tracking-widest text-foreground/40">Heures Restantes</span>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-primary">
                  {bot ? bot.remainingHours.toFixed(1) : "0.0"}
                </span>
                <span className="text-2xl font-black text-foreground/40">h</span>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-sm">
              <RedeemTicketForm userId={userId} />
            </div>
          </CardContent>
        </Card>

        {/* Pricing/Quick Buy */}
        <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Recharger
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border-2 border-primary/10 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
              <div>
                <p className="font-black">72 Heures</p>
                <p className="text-xs font-bold text-foreground/40">Idéal pour tester</p>
              </div>
              <span className="text-lg font-black text-primary">2.00€</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border-2 border-primary/10 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
              <div>
                <p className="font-black">1 Mois (720h)</p>
                <p className="text-xs font-bold text-foreground/40">Le plus populaire</p>
              </div>
              <span className="text-lg font-black text-primary">15.00€</span>
            </div>
            <Button className="w-full h-12 bg-black hover:bg-black/90 text-white font-black rounded-xl cursor-pointer">
              Acheter via WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-2 border-primary/10 shadow-none rounded-3xl overflow-hidden">
        <CardHeader className="border-b-2 border-primary/5 bg-primary/5">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Historique des Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-black uppercase text-xs tracking-wider px-6">ID Transaction</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider">Date</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider">Type</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider">Montant</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider text-right px-6">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-foreground/40 font-bold">
                    Aucune transaction récente.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                    <TableCell className="px-6 py-4 font-mono text-xs font-bold text-foreground/60">
                      {tx.id}
                    </TableCell>
                    <TableCell className="text-sm font-bold">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-black text-xs uppercase">
                        {tx.type === 'ticket' ? <Ticket className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {tx.type}
                      </div>
                    </TableCell>
                    <TableCell className="font-black">
                      {tx.amount.toFixed(2)} {tx.currency}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                        tx.status === 'success' ? 'bg-green-500/10 text-green-600' : 
                        tx.status === 'pending' ? 'bg-orange-500/10 text-orange-600' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {tx.status}
                      </span>
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
