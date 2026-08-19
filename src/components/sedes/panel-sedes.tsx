"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building,
  LayoutGrid,
  ListTree,
  MapPinOff,
  Search,
  X,
} from "lucide-react";

import { FichaSede } from "@/components/sedes/ficha-sede";
import { MapaConceptual } from "@/components/sedes/mapa-conceptual";
import { TarjetaSede } from "@/components/sedes/tarjeta-sede";
import { useRadar } from "@/components/providers/radar-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CIUDADES, FAMILIAS_SEDE, ORDEN_FAMILIAS } from "@/lib/constants";
import { formatearNumero, normalizar, pluralizar } from "@/lib/eventos";
import {
  agruparPorCiudad,
  agruparPorFamilia,
  calcularEstadisticasSedes,
  enriquecerSedes,
  nombreRegion,
  type SedeEnriquecida,
} from "@/lib/sedes";
import type { EventoEnriquecido, Sede } from "@/lib/types";

type Agrupacion = "ciudad" | "familia";

interface PanelSedesProps {
  sedes: Sede[];
  eventos: EventoEnriquecido[];
}

export function PanelSedes({ sedes, eventos }: PanelSedesProps) {
  const { ciudad, setCiudad } = useRadar();

  const [busqueda, setBusqueda] = useState("");
  const [comuna, setComuna] = useState("todas");
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("ciudad");
  const [fichaAbierta, setFichaAbierta] = useState<string | null>(null);
  const [destacada, setDestacada] = useState<string | null>(null);

  const contenedor = useRef<HTMLDivElement>(null);

  const fichas = useMemo(
    () => enriquecerSedes(sedes, eventos),
    [sedes, eventos],
  );

  const delAmbito = useMemo(
    () =>
      ciudad === "todas"
        ? fichas
        : fichas.filter((f) => f.sede.ciudad === ciudad),
    [fichas, ciudad],
  );

  // Las comunas disponibles dependen de la ciudad: al cambiarla, la comuna
  // seleccionada deja de tener sentido y se reinicia.
  const comunas = useMemo(
    () => [...new Set(delAmbito.map((f) => f.sede.comuna))].sort(),
    [delAmbito],
  );

  useEffect(() => {
    setComuna("todas");
  }, [ciudad]);

  const visibles = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return delAmbito.filter((ficha) => {
      if (comuna !== "todas" && ficha.sede.comuna !== comuna) return false;
      if (!termino) return true;
      return normalizar(
        [
          ficha.sede.nombre,
          ficha.sede.direccion,
          ficha.sede.comuna,
          ficha.sede.ciudad,
        ].join(" "),
      ).includes(termino);
    });
  }, [delAmbito, comuna, busqueda]);

  const estadisticas = useMemo(
    () => calcularEstadisticasSedes(visibles),
    [visibles],
  );

  const porCiudad = useMemo(() => agruparPorCiudad(visibles), [visibles]);
  const porFamilia = useMemo(() => agruparPorFamilia(visibles), [visibles]);

  const seleccionada =
    fichaAbierta !== null
      ? (fichas.find((f) => f.sede.id === fichaAbierta) ?? null)
      : null;

  const nombreAmbito =
    comuna !== "todas"
      ? comuna
      : (CIUDADES.find((c) => c.id === ciudad)?.nombre ?? "Todas las ciudades");

  const hayFiltros = busqueda !== "" || comuna !== "todas";

  /** Un clic en el mapa resalta la sede y la trae a la vista. */
  function destacarDesdeMapa(sedeId: string) {
    setDestacada(sedeId);
    const nodo = contenedor.current?.querySelector(`[data-sede="${sedeId}"]`);
    nodo?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function renderGrid(lista: SedeEnriquecida[]) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((ficha) => (
          <div key={ficha.sede.id} data-sede={ficha.sede.id}>
            <TarjetaSede
              ficha={ficha}
              destacada={destacada === ficha.sede.id}
              onVerFicha={setFichaAbierta}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={contenedor}>
      {/* Resumen del ámbito */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="gap-0 py-0">
          <CardContent className="space-y-1 p-4">
            <p className="text-muted-foreground text-xs font-medium">
              Recintos en el ámbito
            </p>
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {formatearNumero(estadisticas.totalSedes)}
            </p>
            <p className="text-muted-foreground text-xs">
              en {pluralizar(estadisticas.ciudades, "ciudad", "ciudades")}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="space-y-1 p-4">
            <p className="text-muted-foreground text-xs font-medium">
              Con actividad este mes
            </p>
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {formatearNumero(estadisticas.sedesActivasEsteMes)}
            </p>
            <p className="text-muted-foreground text-xs">
              {pluralizar(estadisticas.eventosEsteMes, "evento")} en el mes en
              curso
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="space-y-1 p-4">
            <p className="text-muted-foreground text-xs font-medium">
              Recinto más solicitado
            </p>
            <p className="truncate text-sm leading-tight font-semibold">
              {estadisticas.sedeLider?.sede.nombre ?? "—"}
            </p>
            <p className="text-muted-foreground text-xs">
              {estadisticas.sedeLider
                ? `${pluralizar(estadisticas.sedeLider.eventosDelMes.length, "evento")} este mes`
                : "Sin actividad registrada en el mes"}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardContent className="space-y-1 p-4">
            <p className="text-muted-foreground text-xs font-medium">
              Aforo instalado
            </p>
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {formatearNumero(estadisticas.aforoTotal)}
            </p>
            <p className="text-muted-foreground text-xs">
              Suma del aforo máximo de los recintos visibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros locales */}
      <div className="bg-card/40 space-y-3 rounded-lg border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por recinto, dirección o comuna…"
              className="pl-9"
              aria-label="Buscar sedes"
            />
          </div>

          <Select value={ciudad} onValueChange={setCiudad}>
            <SelectTrigger className="w-[190px]" aria-label="Ciudad">
              <SelectValue placeholder="Ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ciudad / Región</SelectLabel>
                {CIUDADES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={comuna} onValueChange={setComuna}>
            <SelectTrigger
              className="w-[180px]"
              aria-label="Comuna"
              disabled={comunas.length <= 1}
            >
              <SelectValue placeholder="Comuna" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Comuna</SelectLabel>
                <SelectItem value="todas">Todas las comunas</SelectItem>
                {comunas.map((nombre) => (
                  <SelectItem key={nombre} value={nombre}>
                    {nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Tabs
            value={agrupacion}
            onValueChange={(valor) => setAgrupacion(valor as Agrupacion)}
          >
            <TabsList>
              <TabsTrigger value="ciudad" className="gap-1.5">
                <LayoutGrid className="size-4" />
                Por ciudad
              </TabsTrigger>
              <TabsTrigger value="familia" className="gap-1.5">
                <ListTree className="size-4" />
                Por tipo
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            <span className="text-foreground font-medium tabular-nums">
              {formatearNumero(visibles.length)}
            </span>{" "}
            de {formatearNumero(fichas.length)} recintos
          </p>
          {hayFiltros && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 gap-1.5 text-xs"
              onClick={() => {
                setBusqueda("");
                setComuna("todas");
              }}
            >
              <X className="size-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      <MapaConceptual
        sedes={visibles}
        seleccionada={destacada ?? undefined}
        onSeleccionar={destacarDesdeMapa}
        ambito={nombreAmbito}
      />

      {visibles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <MapPinOff className="text-muted-foreground size-8" />
          <div>
            <p className="text-sm font-medium">
              Sin recintos para estos filtros
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Cambia la ciudad en el header o quita el filtro por comuna.
            </p>
          </div>
        </div>
      ) : agrupacion === "ciudad" ? (
        <div className="space-y-6">
          {porCiudad.map((grupo) => (
            <section key={grupo.ciudad} className="space-y-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b pb-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Building className="text-muted-foreground size-4" />
                  {grupo.ciudad}
                </h2>
                <span className="text-muted-foreground text-xs">
                  {nombreRegion(grupo.region)} ·{" "}
                  {pluralizar(grupo.sedes.length, "recinto")}
                </span>
                <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                  {grupo.eventosDelMes} este mes · {grupo.eventosProximos}{" "}
                  agendados
                </span>
              </div>
              {renderGrid(grupo.sedes)}
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {ORDEN_FAMILIAS.map((familia) => {
            const lista = porFamilia.get(familia);
            if (!lista || lista.length === 0) return null;
            const config = FAMILIAS_SEDE[familia];

            return (
              <section key={familia} className="space-y-3">
                <div className="border-b pb-2">
                  <h2 className="text-sm font-semibold">
                    {config.etiqueta}
                    <span className="text-muted-foreground ml-1.5 text-xs tabular-nums">
                      ({lista.length})
                    </span>
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {config.descripcion}
                  </p>
                </div>
                {renderGrid(lista)}
              </section>
            );
          })}
        </div>
      )}

      <FichaSede
        ficha={seleccionada}
        abierta={fichaAbierta !== null}
        onOpenChange={(abierta) => !abierta && setFichaAbierta(null)}
      />
    </div>
  );
}
