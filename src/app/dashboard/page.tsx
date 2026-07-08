import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WhatsappBot } from "@/lib/models";
import { DashboardBotControl } from "@/components/dashboard-bot-control";
import { InstanceOrchestrator } from "@/services/instance-orchestrator/orchestrator";

const orchestrator = new InstanceOrchestrator();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const bot = await WhatsappBot.findOne({
    where: { userId },
  });

  const liveStatus = bot ? await orchestrator.getLiveStatus(userId) : "stopped";
  const initialBotData = bot ? { ...bot.toJSON(), liveStatus } : null;

  return (
    <DashboardBotControl initialBot={initialBotData} userId={userId} />
  );
}

