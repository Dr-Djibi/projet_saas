import { NextResponse } from "next/server";
import { InstanceOrchestrator } from "@/services/instance-orchestrator/orchestrator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const orchestrator = new InstanceOrchestrator();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "out") as 'out' | 'err';

  try {
    const logs = await orchestrator.getLogs(userId, type);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Logs error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la lecture des logs" },
      { status: 500 }
    );
  }
}
