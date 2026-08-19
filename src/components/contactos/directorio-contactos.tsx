"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Info,
  Search,
  SlidersHorizontal,
  UserRoundX,
  X,
} from "lucide-react";

import { EstadisticasDirectorioPanel } from "@/components/contactos/estadisticas-directorio";
import { FichaOrganizador } from "@/components/contactos/ficha-organizador";
import type { BorradorContacto } from "@/components/contactos/formulario-contacto";
import { TablaOrganizadores } from "@/components/contactos/tabla-organizadores";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TIPOS_ENTIDAD, TIPOS_ORGANIZADOR } from "@/lib/constants";
import {
  calcularEstadisticas,
  enriquecerOrganizadores,
  filtrarDirectorio,
  type FiltrosDirectorio,
} from "@/lib/directorio";
import { formatearNumero } from "@/lib/eventos";
import type {
  ContactoClave,
  EventoEnriquecido,
  Organizador,
  TipoOrganizador,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTROS_INICIALES: FiltrosDirectorio = {
  busqueda: "",
  tipos: [],
  soloAccionables: false,
};

interface DirectorioContactosProps {
  organizadores: Organizador[];
  contactos: ContactoClave[];
  eventos: EventoEnriquecido[];
}

export function DirectorioContactos({
  organizadores: organizadoresIniciales,
  contactos: contactosIniciales,
  eventos,
}: DirectorioContactosProps) {
  /**
   * Las ediciones viven en memoria: no hay backend todavía. Se avisa en la UI
   * para que nadie confunda un cambio local con un dato persistido.
   */
  const [organizadores, setOrganizadores] = useState(organizadoresIniciales);
  const [contactos, setContactos] = useState(contactosIniciales);
  const [huboEdiciones, setHuboEdiciones] = useState(false);

  const [filtros, setFiltros] = useState<FiltrosDirectorio>(FILTROS_INICIALES);
  const [fichaAbierta, setFichaAbierta] = useState<string | null>(null);

  const fichas = useMemo(
    () => enriquecerOrganizadores(organizadores, contactos, eventos),
    [organizadores, contactos, eventos],
  );

  const visibles = useMemo(
    () =>
      filtrarDirectorio(fichas, filtros).sort(
        (a, b) =>
          b.proximosEventos.length - a.proximosEventos.length ||
          b.eventos.length - a.eventos.length,
      ),
    [fichas, filtros],
  );

  // Las estadísticas describen la base completa, no el resultado del filtro.
  const estadisticas = useMemo(() => calcularEstadisticas(fichas), [fichas]);

  const seleccionada = fichaAbierta
    ? (fichas.find((f) => f.organizador.id === fichaAbierta) ?? null)
    : null;

  const hayFiltros =
    filtros.busqueda !== "" ||
    filtros.tipos.length > 0 ||
    filtros.soloAccionables;

  function alternarTipo(tipo: TipoOrganizador) {
    setFiltros((previos) => ({
      ...previos,
      tipos: previos.tipos.includes(tipo)
        ? previos.tipos.filter((t) => t !== tipo)
        : [...previos.tipos, tipo],
    }));
  }

  function guardarNotas(organizadorId: string, notas: string) {
    setOrganizadores((previos) =>
      previos.map((organizador) =>
        organizador.id === organizadorId
          ? { ...organizador, notasInternas: notas.trim() || undefined }
          : organizador,
      ),
    );
    setHuboEdiciones(true);
  }

  function guardarContacto(
    organizadorId: string,
    borrador: BorradorContacto,
    contactoId?: string,
  ) {
    const campos = {
      nombreResponsable: borrador.nombreResponsable.trim(),
      cargo: borrador.cargo.trim(),
      telefonoCelular: borrador.telefonoCelular.trim() || undefined,
      email: borrador.email.trim() || undefined,
      redSocial: borrador.redSocialUrl.trim()
        ? { tipo: borrador.redSocialTipo, url: borrador.redSocialUrl.trim() }
        : undefined,
      verificado: borrador.verificado,
    };

    if (contactoId) {
      setContactos((previos) =>
        previos.map((contacto) =>
          contacto.id === contactoId ? { ...contacto, ...campos } : contacto,
        ),
      );
    } else {
      const nuevo: ContactoClave = {
        id: `con-local-${Date.now()}`,
        organizadorId,
        ...campos,
      };
      setContactos((previos) => [...previos, nuevo]);
      setOrganizadores((previos) =>
        previos.map((organizador) =>
          organizador.id === organizadorId
            ? {
                ...organizador,
                contactoIds: [...organizador.contactoIds, nuevo.id],
              }
            : organizador,
        ),
      );
    }

    setHuboEdiciones(true);
  }

  return (
    <div className="space-y-6">
      <EstadisticasDirectorioPanel estadisticas={estadisticas} />

      {huboEdiciones && (
        <p className="text-muted-foreground bg-muted/40 flex items-start gap-2 rounded-md border border-dashed p-2.5 text-xs">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Los cambios de esta sesión viven solo en el navegador. Aún no hay
          backend: se pierden al recargar.
        </p>
      )}

      <div className="bg-card/40 space-y-3 rounded-lg border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={filtros.busqueda}
              onChange={(evento) =>
                setFiltros((previos) => ({
                  ...previos,
                  busqueda: evento.target.value,
                }))
              }
              placeholder="Buscar por entidad, persona, cargo o correo…"
              className="pl-9"
              aria-label="Buscar en el directorio"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="text-muted-foreground size-4" />
                Tipo de entidad
                {filtros.tipos.length > 0 && (
                  <Badge variant="secondary" className="px-1.5 tabular-nums">
                    {filtros.tipos.length}
                  </Badge>
                )}
                <ChevronDown className="text-muted-foreground size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-2">
              <div className="space-y-0.5">
                {TIPOS_ENTIDAD.map((tipo) => {
                  const config = TIPOS_ORGANIZADOR[tipo];
                  const total = fichas.filter(
                    (f) => f.organizador.tipo === tipo,
                  ).length;

                  return (
                    <Label
                      key={tipo}
                      className="hover:bg-accent flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm font-normal"
                    >
                      <Checkbox
                        checked={filtros.tipos.includes(tipo)}
                        onCheckedChange={() => alternarTipo(tipo)}
                      />
                      <span
                        className={cn("size-2 rounded-full", config.punto)}
                        aria-hidden
                      />
                      <span className="flex-1">{config.etiqueta}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {total}
                      </span>
                    </Label>
                  );
                })}
              </div>
              {filtros.tipos.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setFiltros((previos) => ({ ...previos, tipos: [] }))
                    }
                  >
                    Quitar selección
                  </Button>
                </>
              )}
            </PopoverContent>
          </Popover>

          <Label className="hover:bg-accent flex h-9 cursor-pointer items-center gap-2.5 rounded-md border px-3 text-sm font-normal">
            <Checkbox
              checked={filtros.soloAccionables}
              onCheckedChange={(valor) =>
                setFiltros((previos) => ({
                  ...previos,
                  soloAccionables: valor === true,
                }))
              }
            />
            Solo contactables
          </Label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            <span className="text-foreground font-medium tabular-nums">
              {formatearNumero(visibles.length)}
            </span>{" "}
            de {formatearNumero(fichas.length)} entidades
          </p>

          {hayFiltros && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 gap-1.5 text-xs"
              onClick={() => setFiltros(FILTROS_INICIALES)}
            >
              <X className="size-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <UserRoundX className="text-muted-foreground size-8" />
          <div>
            <p className="text-sm font-medium">
              Sin entidades para estos filtros
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Prueba con otro término o quita el filtro por tipo.
            </p>
          </div>
          {hayFiltros && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltros(FILTROS_INICIALES)}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <TablaOrganizadores
          fichas={visibles}
          onAbrirFicha={(ficha) => setFichaAbierta(ficha.organizador.id)}
        />
      )}

      <FichaOrganizador
        ficha={seleccionada}
        abierta={fichaAbierta !== null}
        onOpenChange={(abierta) => !abierta && setFichaAbierta(null)}
        onGuardarNotas={guardarNotas}
        onGuardarContacto={guardarContacto}
      />
    </div>
  );
}
