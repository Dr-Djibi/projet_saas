"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Power, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export function InstanceActions({ botId, isActive }: { botId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "start" | "stop") => {
    setLoading(true);
    try {
      const res = await fetch("/api/bots/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de l'action");
      }
    } catch (error) {
      alert("Erreur lors de l'action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
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
    </div>
  );
}
