"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Bot, LayoutDashboard, Settings, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Instances",
    url: "/dashboard/instances",
    icon: Bot,
  },
  {
    title: "Facturation",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Paramètres",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-2 border-primary/10">
      <SidebarHeader className="p-4 border-b-2 border-primary/5">
        <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary transition-all">
            <Bot className="h-6 w-6 text-primary group-hover:text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">{siteConfig.name}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.url || pathname.startsWith(item.url + "/");

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center gap-3 px-4 py-6 rounded-xl hover:bg-primary/5 hover:text-primary transition-all font-bold",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-foreground/70"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t-2 border-primary/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-3 px-4 py-6 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all font-bold text-foreground/70"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
