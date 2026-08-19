"use client";

import { BadgeCheck, ShieldAlert, UserRoundX } from "lucide-react";

import { AccionesComunicacion } from "@/components/contactos/acciones-comunicacion";
import { BadgeUrgencia } from "@/components/eventos/badges";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TIPOS_ORGANIZADOR } from "@/lib/constants";
import type { OrganizadorEnriquecido } from "@/lib/directorio";
import { formatearRango, pluralizar } from "@/lib/eventos";
import { cn } from "@/lib/utils";

interface TablaOrganizadoresProps {
  fichas: OrganizadorEnriquecido[];
  onAbrirFicha: (ficha: OrganizadorEnriquecido) => void;
}

export function TablaOrganizadores({
  fichas,
  onAbrirFicha,
}: TablaOrganizadoresProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[260px]">
              Organizador / Entidad
            </TableHead>
            <TableHead className="min-w-[200px]">Contacto clave</TableHead>
            <TableHead className="w-[130px]">Comunicación</TableHead>
            <TableHead className="min-w-[210px]">Último evento</TableHead>
            <TableHead className="min-w-[230px]">Próximos agendados</TableHead>
            <TableHead className="w-[90px] text-right">Ficha</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {fichas.map((ficha) => {
            const tipo = TIPOS_ORGANIZADOR[ficha.organizador.tipo];
            const contacto = ficha.contactoClave;
            const proximo = ficha.proximosEventos[0];
            const otros = ficha.proximosEventos.length - 1;

            return (
              <TableRow key={ficha.organizador.id} className="align-top">
                <TableCell className="py-3">
                  <p className="font-medium">{ficha.organizador.nombre}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs",
                        tipo.texto,
                      )}
                    >
                      <span
                        className={cn("size-1.5 rounded-full", tipo.punto)}
                        aria-hidden
                      />
                      {tipo.etiquetaCorta}
                    </span>
                    {ficha.organizador.rubro && (
                      <span className="text-muted-foreground text-xs">
                        · {ficha.organizador.rubro}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                    {pluralizar(ficha.eventos.length, "evento")} registrado
                    {ficha.eventos.length === 1 ? "" : "s"}
                    {ficha.ciudades.length > 0 &&
                      ` · ${ficha.ciudades.join(", ")}`}
                  </p>
                </TableCell>

                <TableCell className="py-3">
                  {contacto ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <p className="truncate">{contacto.nombreResponsable}</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="shrink-0">
                              {contacto.verificado ? (
                                <BadgeCheck className="text-cat-charla size-3.5" />
                              ) : (
                                <ShieldAlert className="text-proximo size-3.5" />
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {contacto.verificado
                              ? "Datos verificados con el organizador"
                              : "Sin verificar — confirmar antes de usar"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        {contacto.cargo}
                      </p>
                      {ficha.contactos.length > 1 && (
                        <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                          +{ficha.contactos.length - 1} contacto
                          {ficha.contactos.length > 2 ? "s" : ""} más
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <UserRoundX className="size-3.5" />
                      Sin contacto registrado
                    </span>
                  )}
                </TableCell>

                <TableCell className="py-3">
                  {contacto ? (
                    <AccionesComunicacion contacto={contacto} ficha={ficha} />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>

                <TableCell className="py-3">
                  {ficha.ultimoEvento ? (
                    <>
                      <p className="line-clamp-2 text-xs">
                        {ficha.ultimoEvento.titulo}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                        {formatearRango(
                          ficha.ultimoEvento.fechaInicio,
                          ficha.ultimoEvento.fechaFin,
                        )}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Sin historial previo
                    </span>
                  )}
                </TableCell>

                <TableCell className="py-3">
                  {proximo ? (
                    <>
                      <BadgeUrgencia
                        nivel={proximo.alerta.nivelUrgencia}
                        diasRestantes={proximo.alerta.diasRestantes}
                      />
                      <p className="mt-1 line-clamp-2 text-xs">
                        {proximo.titulo}
                      </p>
                      {otros > 0 && (
                        <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                          +{otros} más agendado{otros > 1 ? "s" : ""}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Nada agendado
                    </span>
                  )}
                </TableCell>

                <TableCell className="py-3 text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => onAbrirFicha(ficha)}
                  >
                    Ver ficha
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
