"use client";

import { LayoutDashboard, Bot, CreditCard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Accueil",    url: "/dashboard",           icon: LayoutDashboard },
  { title: "Bots",       url: "/dashboard/instances", icon: Bot },
  { title: "Prix",       url: "/dashboard/billing",   icon: CreditCard },
  { title: "Profil",     url: "/dashboard/settings",  icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    /* Safe area + spacing from screen edge */
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-safe-bottom px-4 pb-4">
      <nav
        className="
          flex items-center justify-around
          h-[68px] px-2
          bg-card/90 backdrop-blur-2xl
          border border-border/40
          rounded-[22px]
          shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(201,162,39,0.08)]
        "
        role="navigation"
        aria-label="Navigation principale"
      >
        {navItems.map((item) => {
          const isActive = item.url === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.url || pathname.startsWith(item.url + "/");
          return (
            <Link
              key={item.url}
              href={item.url}
              aria-label={item.title}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                /* Cible tactile WCAG 2.2 : 44x44px minimum */
                "relative flex flex-col items-center justify-center gap-1",
                "flex-1 min-h-[44px] rounded-xl",
                "transition-all duration-200 ease-out",
                "active:scale-90",
                isActive
                  ? "text-primary"
                  : "text-foreground/40 hover:text-foreground/70"
              )}
            >
              {/* Active background pill */}
              {isActive && (
                <span
                  className="
                    absolute inset-x-1 inset-y-1
                    bg-primary/10 rounded-xl
                    animate-scale-in
                  "
                  aria-hidden="true"
                />
              )}

              <item.icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-transform duration-200",
                  isActive ? "scale-110 stroke-[2.5px]" : "stroke-2"
                )}
              />
              <span
                className={cn(
                  "relative z-10 text-[10px] font-black uppercase tracking-tight transition-all",
                  isActive ? "text-primary" : "text-foreground/40"
                )}
              >
                {item.title}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <span
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-5 bg-primary rounded-full"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
