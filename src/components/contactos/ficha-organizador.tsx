"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  ExternalLink,
  MapPin,
  NotebookPen,
  Pencil,
  Plus,
  ShieldAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { AccionesComunicacion } from "@/components/contactos/acciones-comunicacion";
import {
  FormularioContacto,
  type BorradorContacto,
} from "@/components/contactos/formulario-contacto";
import { BadgeCategoria, BadgeUrgencia } from "@/components/eventos/badges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TIPOS_ORGANIZADOR, TIPOS_SEDE } from "@/lib/constants";
import type { OrganizadorEnriquecido } from "@/lib/directorio";
import { formatearNumero, formatearRango, pluralizar } from "@/lib/eventos";
import type { ContactoClave } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FichaOrganizadorProps {
  ficha: OrganizadorEnriquecido | null;
  abierta: boolean;
  onOpenChange: (abierta: boolean) => void;
  onGuardarNotas: (organizadorId: string, notas: string) => void;
  onGuardarContacto: (
    organizadorId: string,
    borrador: BorradorContacto,
    contactoId?: string,
  ) => void;
}

function EncabezadoContacto({
  contacto,
  ficha,
  onEditar,
}: {
  contacto: ContactoClave;
  ficha: OrganizadorEnriquecido;
  onEditar: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">
            {contacto.nombreResponsable}
          </p>
          {contacto.verificado ? (
            <BadgeCheck className="text-cat-charla size-3.5 shrink-0" />
          ) : (
            <ShieldAlert className="text-proximo size-3.5 shrink-0" />
          )}
        </div>
        <p className="text-muted-foreground truncate text-xs">
          {contacto.cargo}
        </p>
        <p className="text-muted-foreground mt-1 truncate text-xs">
          {contacto.telefonoCelular ?? "sin celular"} ·{" "}
          {contacto.email ?? "sin correo"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <AccionesComunicacion contacto={contacto} ficha={ficha} />
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onEditar}
          aria-label={`Editar ${contacto.nombreResponsable}`}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function FichaOrganizador({
  ficha,
  abierta,
  onOpenChange,
  onGuardarNotas,
  onGuardarContacto,
}: FichaOrganizadorProps) {
  const [notas, setNotas] = useState("");
  const [editando, setEditando] = useState<string | "nuevo" | null>(null);

  // Al cambiar de organizador se recarga el borrador de notas y se cierra
  // cualquier formulario abierto, para no arrastrar el estado de otra ficha.
  useEffect(() => {
    setNotas(ficha?.organizador.notasInternas ?? "");
    setEditando(null);
  }, [ficha]);

  if (!ficha) return null;

  const { organizador, contactos, eventos, proximosEventos, sedesHabituales } =
    ficha;
  const tipo = TIPOS_ORGANIZADOR[organizador.tipo];
  const pasados = eventos.filter((e) => e.alerta.diasRestantes < 0);
  const notasCambiadas = notas !== (organizador.notasInternas ?? "");

  return (
    <Dialog open={abierta} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                tipo.texto,
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", tipo.punto)}
                aria-hidden
              />
              {tipo.etiqueta}
            </span>
            {organizador.rubro && (
              <span className="text-muted-foreground text-xs">
                {organizador.rubro}
              </span>
            )}
          </div>

          <DialogTitle className="text-left text-lg">
            {organizador.nombre}
          </DialogTitle>

          <DialogDescription className="text-left">
            {pluralizar(eventos.length, "evento")} en el historial ·{" "}
            {pluralizar(contactos.length, "contacto")} ·{" "}
            {formatearNumero(ficha.asistentesAcumulados)} asistentes acumulados
            {ficha.ciudades.length > 0 && ` · ${ficha.ciudades.join(", ")}`}
          </DialogDescription>

          {organizador.sitioWeb && (
            <a
              href={organizador.sitioWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1.5 text-xs"
            >
              <ExternalLink className="size-3.5" />
              {organizador.sitioWeb.replace(/^https?:\/\//, "")}
            </a>
          )}
        </DialogHeader>

        <Tabs defaultValue="historial">
          <TabsList className="w-full">
            <TabsTrigger value="historial" className="flex-1 gap-1.5">
              <Building2 className="size-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="sedes" className="flex-1 gap-1.5">
              <MapPin className="size-4" />
              Sedes
            </TabsTrigger>
            <TabsTrigger value="contactos" className="flex-1 gap-1.5">
              <Users className="size-4" />
              Contactos
            </TabsTrigger>
            <TabsTrigger value="notas" className="flex-1 gap-1.5">
              <NotebookPen className="size-4" />
              Notas
            </TabsTrigger>
          </TabsList>

          {/* --- Historial de eventos ------------------------------------- */}
          <TabsContent value="historial" className="space-y-4 pt-4">
            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                Próximos eventos agendados
                <span className="text-muted-foreground ml-1.5 tabular-nums">
                  ({proximosEventos.length})
                </span>
              </h3>
              {proximosEventos.length === 0 ? (
                <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
                  Sin eventos futuros detectados para esta entidad.
                </p>
              ) : (
                <ul className="space-y-2">
                  {proximosEventos.map((evento) => (
                    <li
                      key={evento.id}
                      className="flex flex-wrap items-center gap-2 rounded-md border p-2.5"
                    >
                      <BadgeUrgencia
                        nivel={evento.alerta.nivelUrgencia}
                        diasRestantes={evento.alerta.diasRestantes}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {evento.titulo}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {evento.sede.ciudad} ·{" "}
                        {formatearRango(evento.fechaInicio, evento.fechaFin)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Separator />

            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                Ediciones realizadas
                <span className="text-muted-foreground ml-1.5 tabular-nums">
                  ({pasados.length})
                </span>
              </h3>
              {pasados.length === 0 ? (
                <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
                  Sin historial previo registrado.
                </p>
              ) : (
                <ul className="space-y-2">
                  {pasados.map((evento) => (
                    <li
                      key={evento.id}
                      className="flex flex-wrap items-center gap-2 rounded-md border p-2.5"
                    >
                      <BadgeCategoria categoria={evento.categoria} corta />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {evento.titulo}
                      </span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {formatearRango(evento.fechaInicio, evento.fechaFin)} ·{" "}
                        {formatearNumero(evento.estimadoAsistentes)} asistentes
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </TabsContent>

          {/* --- Sedes habituales ----------------------------------------- */}
          <TabsContent value="sedes" className="space-y-2 pt-4">
            {sedesHabituales.length === 0 ? (
              <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
                Sin sedes registradas para esta entidad.
              </p>
            ) : (
              sedesHabituales.map(({ sede, veces }) => (
                <div
                  key={sede.id}
                  className="flex items-start gap-3 rounded-md border p-3"
                >
                  <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {sede.nombre}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {TIPOS_SEDE[sede.tipo].etiqueta} · {sede.direccion},{" "}
                      {sede.ciudad}
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {pluralizar(veces, "vez", "veces")}
                  </span>
                </div>
              ))
            )}
          </TabsContent>

          {/* --- Contactos ------------------------------------------------ */}
          <TabsContent value="contactos" className="space-y-3 pt-4">
            {contactos.length === 0 && editando !== "nuevo" && (
              <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
                Sin contactos registrados. Agrega el primero para poder
                gestionar esta entidad.
              </p>
            )}

            {contactos.map((contacto) =>
              editando === contacto.id ? (
                <FormularioContacto
                  key={contacto.id}
                  contacto={contacto}
                  onCancelar={() => setEditando(null)}
                  onGuardar={(borrador) => {
                    onGuardarContacto(organizador.id, borrador, contacto.id);
                    setEditando(null);
                    toast.success("Contacto actualizado", {
                      description: borrador.nombreResponsable,
                    });
                  }}
                />
              ) : (
                <EncabezadoContacto
                  key={contacto.id}
                  contacto={contacto}
                  ficha={ficha}
                  onEditar={() => setEditando(contacto.id)}
                />
              ),
            )}

            {editando === "nuevo" ? (
              <FormularioContacto
                onCancelar={() => setEditando(null)}
                onGuardar={(borrador) => {
                  onGuardarContacto(organizador.id, borrador);
                  setEditando(null);
                  toast.success("Contacto agregado", {
                    description: borrador.nombreResponsable,
                  });
                }}
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => setEditando("nuevo")}
              >
                <Plus className="size-4" />
                Agregar contacto secundario
              </Button>
            )}
          </TabsContent>

          {/* --- Notas internas ------------------------------------------- */}
          <TabsContent value="notas" className="space-y-3 pt-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Notas de prospección</p>
              <p className="text-muted-foreground text-xs">
                Convenios previos, tarifas acordadas, con quién escalar y qué
                evitar. Lo que el equipo necesita saber antes de llamar.
              </p>
            </div>

            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={8}
              placeholder="Ej: convenio de auspicio vigente desde 2024; pedir brief por correo antes de agendar…"
            />

            <div className="flex items-center justify-end gap-2">
              {notasCambiadas && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotas(organizador.notasInternas ?? "")}
                >
                  Descartar cambios
                </Button>
              )}
              <Button
                size="sm"
                disabled={!notasCambiadas}
                onClick={() => {
                  onGuardarNotas(organizador.id, notas);
                  toast.success("Notas guardadas", {
                    description: organizador.nombre,
                  });
                }}
              >
                Guardar notas
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
