import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WhatsappBot } from "@/lib/models";
import { DashboardBotControl } from "@/components/dashboard-bot-control";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const bot = await WhatsappBot.findOne({
    where: { userId },
  }) as any;

  return (
    <DashboardBotControl initialBot={bot ? bot.toJSON() : null} userId={userId} />
  );
}

