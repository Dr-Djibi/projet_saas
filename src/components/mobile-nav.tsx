"use client";

import { LayoutDashboard, Bot, Settings, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bots",
    url: "/dashboard/instances",
    icon: Bot,
  },
  {
    title: "Prix",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Profil",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
      <nav className="flex items-center justify-around h-16 bg-white/90 backdrop-blur-lg border-2 border-primary/10 rounded-2xl shadow-xl shadow-primary/5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all rounded-xl",
                isActive ? "text-primary scale-110" : "text-foreground/40 hover:text-primary/60"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive ? "stroke-[3px]" : "stroke-[2px]")} />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {item.title}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 h-1 w-4 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
