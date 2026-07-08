import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col pb-24 md:pb-0 min-w-0">
          <header className="h-16 flex items-center px-6 border-b-2 border-primary/5 bg-background/50 backdrop-blur-md sticky top-0 z-10">
            <SidebarTrigger className="cursor-pointer hidden md:flex" />
            <div className="md:hidden flex items-center gap-2">
              <span className="font-black text-primary">Menma VPS</span>
            </div>
            <div className="ml-4 h-6 w-[2px] bg-primary/10 hidden md:block" />
          </header>
          <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto">
            {children}
          </div>
          <MobileNav />
        </main>
      </div>
    </SidebarProvider>
  );
}
