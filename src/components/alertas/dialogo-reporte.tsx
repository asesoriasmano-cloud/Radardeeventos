"use client";

import { useState } from "react";
import { Check, Copy, Download, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { descargarCsv, formatearNumero } from "@/lib/eventos";
import type { Reporte } from "@/lib/metricas";

interface DialogoReporteProps {
  reporte: Reporte;
  abierto: boolean;
  onOpenChange: (abierto: boolean) => void;
}

export function DialogoReporte({
  reporte,
  abierto,
  onOpenChange,
}: DialogoReporteProps) {
  const [copiado, setCopiado] = useState(false);
  const hoy = new Date().toISOString().slice(0, 10);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(reporte.texto);
      setCopiado(true);
      toast.success("Reporte copiado al portapapeles");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar", {
        description: "El navegador bloqueó el acceso al portapapeles.",
      });
    }
  }

  function descargarComoCsv() {
    descargarCsv(`reporte-alertas-${hoy}.csv`, reporte.csv);
    toast.success("CSV descargado", {
      description: `${formatearNumero(reporte.eventos.length)} eventos`,
    });
  }

  /**
   * PDF vía el diálogo de impresión del navegador: es la única vía sin añadir
   * una dependencia de render, y deja al usuario elegir "Guardar como PDF".
   */
  function imprimir() {
    const ventana = window.open("", "_blank", "width=820,height=900");
    if (!ventana) {
      toast.error("El navegador bloqueó la ventana de impresión");
      return;
    }

    const escapado = reporte.texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    ventana.document.write(
      `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
        `<title>${reporte.titulo}</title>` +
        `<style>` +
        `body{font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#111;margin:32px;}` +
        `pre{white-space:pre-wrap;word-break:break-word;}` +
        `@page{margin:18mm;}` +
        `</style></head><body><pre>${escapado}</pre></body></html>`,
    );
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            {reporte.titulo}
          </DialogTitle>
          <DialogDescription>
            Generado el {reporte.generadoEn} ·{" "}
            {formatearNumero(reporte.eventos.length)} eventos. Cópialo tal cual
            a un correo o al canal del equipo, o descárgalo para trabajarlo en
            planilla.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="bg-muted/30 h-[45dvh] rounded-md border">
          <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {reporte.texto}
          </pre>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={imprimir}
          >
            <Printer className="size-4" />
            Imprimir / Guardar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={descargarComoCsv}
          >
            <Download className="size-4" />
            Descargar CSV
          </Button>
          <Button size="sm" className="gap-2" onClick={copiar}>
            {copiado ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copiado ? "Copiado" : "Copiar resumen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
