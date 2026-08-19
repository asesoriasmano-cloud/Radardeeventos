import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { RadarProvider } from "@/components/providers/radar-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <RadarProvider>
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
        {/* La app es dark-only: se fija el tema en vez de leerlo de next-themes. */}
        <Toaster theme="dark" position="bottom-right" />
      </RadarProvider>
    </TooltipProvider>
  );
}
