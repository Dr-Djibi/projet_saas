"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Power, Play, Trash2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function InstanceActions({ botId, isActive, onViewLogs }: { botId: string; isActive: boolean; onViewLogs: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "start" | "stop" | "delete") => {
    if (action === "delete" && !confirm("Êtes-vous sûr de vouloir supprimer cette instance ?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bots/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, botId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de l'action");
      }
    } catch (_error) {
      alert("Erreur lors de l'action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-9 px-3 text-foreground/60 hover:text-foreground font-black cursor-pointer"
        onClick={onViewLogs}
      >
        <FileText className="h-4 w-4 mr-1" /> Logs
      </Button>
      {isActive ? (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-9 px-3 border-2 border-destructive text-destructive hover:bg-destructive/5 font-black cursor-pointer"
          onClick={() => handleAction("stop")}
          disabled={loading}
        >
          <Power className="h-4 w-4 mr-1" /> {loading ? "..." : "Stop"}
        </Button>
      ) : (
        <Button 
          size="sm" 
          className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white font-black border-b-4 border-black/20 active:border-b-0 active:translate-y-[1px] cursor-pointer"
          onClick={() => handleAction("start")}
          disabled={loading}
        >
          <Play className="h-4 w-4 mr-1" /> {loading ? "..." : "Start"}
        </Button>
      )}
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-9 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive font-black cursor-pointer"
        onClick={() => handleAction("delete")}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
