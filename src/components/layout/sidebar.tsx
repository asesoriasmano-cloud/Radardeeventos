"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Radar } from "lucide-react";

import { useRadar } from "@/components/providers/radar-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAVEGACION } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarColapsado, alternarSidebar } = useRadar();

  return (
    <aside
      data-colapsado={sidebarColapsado}
      className={cn(
        "sticky top-0 z-30 flex h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out",
        sidebarColapsado ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Radar className="size-5" />
        </div>
        {!sidebarColapsado && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-tight font-semibold">
              Radar de Eventos
            </p>
            <p className="text-muted-foreground truncate text-xs leading-tight">
              Congregaciones y terreno
            </p>
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAVEGACION.map((item) => {
          const activo =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icono = item.icono;

          const enlace = (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                sidebarColapsado && "justify-center px-0",
                activo
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icono
                className={cn(
                  "size-4 shrink-0",
                  activo ? "text-primary" : "text-current",
                )}
              />
              {!sidebarColapsado && (
                <span className="truncate">{item.titulo}</span>
              )}
            </Link>
          );

          if (!sidebarColapsado) return enlace;

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{enlace}</TooltipTrigger>
              <TooltipContent side="right">{item.titulo}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={alternarSidebar}
          aria-label={
            sidebarColapsado ? "Expandir navegación" : "Colapsar navegación"
          }
          className={cn(
            "text-muted-foreground w-full justify-start gap-3",
            sidebarColapsado && "justify-center",
          )}
        >
          {sidebarColapsado ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              <span>Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
