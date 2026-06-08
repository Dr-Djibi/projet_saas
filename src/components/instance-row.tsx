"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { InstanceActions } from "@/components/instance-actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function InstanceRow({ bot }: { bot: any }) {
  const [logs, setLogs] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchLogs = async () => {
    setIsOpen(true);
    const res = await fetch(`/api/bots/logs?type=out`);
    const data = await res.json();
    setLogs(data.logs || "Pas de logs");
  };

  return (
    <>
      <TableRow className="hover:bg-primary/5 transition-colors border-b border-primary/5">
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
              {bot.status === 'active' ? "Actif" : bot.status === 'paused' ? "Pausé" : "Expiré"}
            </span>
          </div>
        </TableCell>
        <TableCell>
            <span className="text-xs font-mono text-foreground/60">{bot.port || "N/A"}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
            {bot.remainingHours.toFixed(2)}h
          </span>
        </TableCell>
        <TableCell className="px-6 text-right">
          <InstanceActions botId={bot.id} isActive={bot.isActive} onViewLogs={fetchLogs} />
        </TableCell>
      </TableRow>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[600px] sm:w-[800px]">
          <SheetHeader>
            <SheetTitle>Logs du Bot: {bot.botName}</SheetTitle>
            <SheetDescription>Dernières lignes des logs</SheetDescription>
          </SheetHeader>
          <div className="mt-4 p-4 bg-black text-green-400 font-mono text-xs rounded-lg overflow-auto h-[80vh] whitespace-pre-wrap">
            {logs}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
