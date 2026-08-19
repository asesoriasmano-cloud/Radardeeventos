"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarX2, LayoutGrid, Rows3, Download } from "lucide-react";
import { toast } from "sonner";

import { BarraFiltros } from "@/components/eventos/barra-filtros";
import { DialogoDetalle } from "@/components/eventos/dialogo-detalle";
import { TarjetaEvento } from "@/components/eventos/tarjeta-evento";
import { VistaTabla } from "@/components/eventos/vista-tabla";
import { useRadar } from "@/components/providers/radar-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AFORO_MAX,
  AFORO_MIN,
  NIVELES_URGENCIA,
  ORDEN_URGENCIA,
} from "@/lib/constants";
import {
  descargarCsv,
  eventosACsv,
  filtrarEventos,
  formatearNumero,
  ordenarEventos,
} from "@/lib/eventos";
import type {
  ColumnaOrdenable,
  EventoEnriquecido,
  FiltrosEventos,
  ModoVista,
  Orden,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTROS_INICIALES: FiltrosEventos = {
  busqueda: "",
  categorias: [],
  desde: undefined,
  hasta: undefined,
  ciudad: "todas",
  aforo: [AFORO_MIN, AFORO_MAX],
};

export function ExploradorEventos({
  eventos,
  busquedaInicial = "",
}: {
  eventos: EventoEnriquecido[];
  /** Precarga del buscador, típicamente vía `?q=` desde otra vista. */
  busquedaInicial?: string;
}) {
  const { ciudad, setCiudad, ventana } = useRadar();

  const [filtros, setFiltros] = useState<FiltrosEventos>({
    ...FILTROS_INICIALES,
    busqueda: busquedaInicial,
    ciudad,
  });
  const [modo, setModo] = useState<ModoVista>("tarjetas");
  const [orden, setOrden] = useState<Orden>({
    columna: "fechaInicio",
    direccion: "asc",
  });
  const [detalle, setDetalle] = useState<EventoEnriquecido | null>(null);

  // La ciudad es un filtro global: el selector del header y el de la barra de
  // filtros manipulan el mismo estado, no dos copias que puedan divergir.
  useEffect(() => {
    setFiltros((previos) =>
      previos.ciudad === ciudad ? previos : { ...previos, ciudad },
    );
  }, [ciudad]);

  function cambiarFiltros(parcial: Partial<FiltrosEventos>) {
    if (parcial.ciudad && parcial.ciudad !== ciudad) setCiudad(parcial.ciudad);
    setFiltros((previos) => ({ ...previos, ...parcial }));
  }

  function limpiarFiltros() {
    // Limpiar borra también la búsqueda precargada: si el usuario la quita, es
    // porque quiere salir del contexto con el que llegó.
    setFiltros({ ...FILTROS_INICIALES, ciudad });
  }

  /**
   * Alcance base: la ventana del header. Si el usuario elige un rango de
   * fechas explícito, manda el rango — así puede alcanzar eventos ya
   * finalizados o más lejanos que la ventana.
   */
  const enVentana = useMemo(() => {
    if (filtros.desde) return eventos;
    return eventos.filter(
      (evento) =>
        evento.alerta.diasRestantes >= 0 &&
        evento.alerta.diasRestantes <= ventana,
    );
  }, [eventos, filtros.desde, ventana]);

  const visibles = useMemo(
    () => ordenarEventos(filtrarEventos(enVentana, filtros), orden),
    [enVentana, filtros, orden],
  );

  const resumen = useMemo(() => {
    return ORDEN_URGENCIA.map((nivel) => ({
      nivel,
      total: visibles.filter((e) => e.alerta.nivelUrgencia === nivel).length,
    }));
  }, [visibles]);

  const hayFiltrosActivos =
    filtros.busqueda !== "" ||
    filtros.categorias.length > 0 ||
    filtros.desde !== undefined ||
    filtros.ciudad !== "todas" ||
    filtros.aforo[0] !== AFORO_MIN ||
    filtros.aforo[1] !== AFORO_MAX;

  function alternarOrden(columna: ColumnaOrdenable) {
    setOrden((previo) =>
      previo.columna === columna
        ? { columna, direccion: previo.direccion === "asc" ? "desc" : "asc" }
        : { columna, direccion: "asc" },
    );
  }

  function exportar(lista: EventoEnriquecido[], nombre: string) {
    if (lista.length === 0) {
      toast.error("No hay eventos que exportar");
      return;
    }
    descargarCsv(nombre, eventosACsv(lista));
    toast.success(
      lista.length === 1
        ? "Evento exportado"
        : `${formatearNumero(lista.length)} eventos exportados`,
      { description: nombre },
    );
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <BarraFiltros
        filtros={filtros}
        onCambiar={cambiarFiltros}
        onLimpiar={limpiarFiltros}
        hayFiltrosActivos={hayFiltrosActivos}
        resultados={visibles.length}
        total={enVentana.length}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {resumen.map(({ nivel, total }) => {
            const config = NIVELES_URGENCIA[nivel];
            return (
              <div
                key={nivel}
                className="flex items-center gap-2 text-xs"
                title={config.descripcion}
              >
                <span
                  className={cn("size-2 rounded-full", config.punto)}
                  aria-hidden
                />
                <span className="text-muted-foreground">{config.etiqueta}</span>
                <span className="font-medium tabular-nums">{total}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => exportar(visibles, `eventos-${hoy}.csv`)}
          >
            <Download className="size-4" />
            Exportar vista
          </Button>

          <Tabs
            value={modo}
            onValueChange={(valor) => setModo(valor as ModoVista)}
          >
            <TabsList>
              <TabsTrigger value="tarjetas" className="gap-1.5">
                <LayoutGrid className="size-4" />
                Tarjetas
              </TabsTrigger>
              <TabsTrigger value="tabla" className="gap-1.5">
                <Rows3 className="size-4" />
                Tabla
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <CalendarX2 className="text-muted-foreground size-8" />
          <div>
            <p className="text-sm font-medium">
              Sin eventos para estos filtros
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Amplía la ventana de tiempo en el header o quita algún filtro.
            </p>
          </div>
          {hayFiltrosActivos && (
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : modo === "tarjetas" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibles.map((evento) => (
            <TarjetaEvento
              key={evento.id}
              evento={evento}
              onVerDetalles={setDetalle}
              onExportar={(uno) => exportar([uno], `${uno.id}.csv`)}
            />
          ))}
        </div>
      ) : (
        <VistaTabla
          eventos={visibles}
          orden={orden}
          onOrdenar={alternarOrden}
          onVerDetalles={setDetalle}
          onExportar={(uno) => exportar([uno], `${uno.id}.csv`)}
        />
      )}

      <DialogoDetalle
        evento={detalle}
        abierto={detalle !== null}
        onOpenChange={(abierto) => !abierto && setDetalle(null)}
        onExportar={(uno) => exportar([uno], `${uno.id}.csv`)}
      />
    </div>
  );
}
