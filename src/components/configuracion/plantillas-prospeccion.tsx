"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { VARIABLES_PLANTILLA } from "@/lib/constants";
import {
  renderizarPlantilla,
  variablesDesconocidas,
} from "@/lib/configuracion";
import { numeroWhatsApp } from "@/lib/eventos";
import type { ConfiguracionAlertas, EventoEnriquecido } from "@/lib/types";

interface PlantillasProspeccionProps {
  configuracion: ConfiguracionAlertas;
  onCambio: (parcial: Partial<ConfiguracionAlertas>) => void;
  muestra?: EventoEnriquecido;
}

function ListaVariables() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {VARIABLES_PLANTILLA.map((variable) => (
        <span
          key={variable.clave}
          title={variable.descripcion}
          className="bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[11px]"
        >
          {variable.clave}
        </span>
      ))}
    </div>
  );
}

function Avisos({ plantilla }: { plantilla: string }) {
  const desconocidas = variablesDesconocidas(plantilla);
  if (desconocidas.length === 0) return null;

  return (
    <p className="text-urgente bg-urgente-soft border-urgente/40 flex items-start gap-2 rounded-md border px-3 py-2 text-xs">
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
      <span>
        {desconocidas.join(", ")} no{" "}
        {desconocidas.length === 1 ? "existe" : "existen"} como variable: se
        enviarían tal cual, entre llaves.
      </span>
    </p>
  );
}

export function PlantillasProspeccion({
  configuracion,
  onCambio,
  muestra,
}: PlantillasProspeccionProps) {
  const [copiado, setCopiado] = useState<string | null>(null);

  const vistaWhatsApp = muestra
    ? renderizarPlantilla(configuracion.plantillaWhatsApp, muestra)
    : undefined;
  const vistaAsunto = muestra
    ? renderizarPlantilla(configuracion.asuntoCorreo, muestra)
    : undefined;
  const vistaCorreo = muestra
    ? renderizarPlantilla(configuracion.plantillaCorreo, muestra)
    : undefined;

  async function copiar(texto: string, clave: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      window.setTimeout(() => setCopiado(null), 1600);
      toast.success("Mensaje copiado al portapapeles.");
    } catch {
      toast.error("El navegador bloqueó el acceso al portapapeles.");
    }
  }

  const telefono = muestra?.contactoPrincipal?.telefonoCelular;
  const correo = muestra?.contactoPrincipal?.email;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageCircle className="text-muted-foreground size-4" />
          Plantillas de prospección
        </CardTitle>
        <CardDescription className="text-xs">
          {muestra ? (
            <>
              La vista previa se arma contra un evento real del radar:{" "}
              <span className="text-foreground">{muestra.titulo}</span>.
            </>
          ) : (
            "Sin eventos vigentes en el radar no hay con qué previsualizar."
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ListaVariables />

        <Tabs defaultValue="whatsapp" className="space-y-3">
          <TabsList>
            <TabsTrigger value="whatsapp" className="gap-1.5">
              <MessageCircle className="size-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="correo" className="gap-1.5">
              <Mail className="size-4" />
              Correo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp" className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="plantilla-whatsapp" className="text-xs">
                Mensaje
              </Label>
              <Textarea
                id="plantilla-whatsapp"
                value={configuracion.plantillaWhatsApp}
                onChange={(evento) =>
                  onCambio({ plantillaWhatsApp: evento.target.value })
                }
                className="min-h-[130px] text-sm"
              />
            </div>
            <Avisos plantilla={configuracion.plantillaWhatsApp} />

            {vistaWhatsApp && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium">
                  Vista previa
                </p>
                <p className="bg-muted/40 rounded-lg border p-3 text-sm whitespace-pre-wrap">
                  {vistaWhatsApp}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => copiar(vistaWhatsApp, "whatsapp")}
                  >
                    {copiado === "whatsapp" ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    Copiar
                  </Button>
                  {telefono ? (
                    <Button asChild size="sm" className="gap-2">
                      <a
                        href={`https://wa.me/${numeroWhatsApp(telefono)}?text=${encodeURIComponent(vistaWhatsApp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="size-4" />
                        Abrir con{" "}
                        {muestra?.contactoPrincipal?.nombreResponsable}
                      </a>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground self-center text-xs">
                      El contacto de muestra no tiene celular registrado.
                    </span>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="correo" className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="asunto-correo" className="text-xs">
                Asunto
              </Label>
              <Input
                id="asunto-correo"
                value={configuracion.asuntoCorreo}
                onChange={(evento) =>
                  onCambio({ asuntoCorreo: evento.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plantilla-correo" className="text-xs">
                Cuerpo
              </Label>
              <Textarea
                id="plantilla-correo"
                value={configuracion.plantillaCorreo}
                onChange={(evento) =>
                  onCambio({ plantillaCorreo: evento.target.value })
                }
                className="min-h-[190px] text-sm"
              />
            </div>
            <Avisos
              plantilla={`${configuracion.asuntoCorreo}\n${configuracion.plantillaCorreo}`}
            />

            {vistaCorreo && vistaAsunto && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium">
                  Vista previa
                </p>
                <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
                  <p className="text-sm font-medium">{vistaAsunto}</p>
                  <p className="text-sm whitespace-pre-wrap">{vistaCorreo}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      copiar(`${vistaAsunto}\n\n${vistaCorreo}`, "correo")
                    }
                  >
                    {copiado === "correo" ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    Copiar
                  </Button>
                  {correo ? (
                    <Button asChild size="sm" className="gap-2">
                      <a
                        href={`mailto:${correo}?subject=${encodeURIComponent(vistaAsunto)}&body=${encodeURIComponent(vistaCorreo)}`}
                      >
                        <Mail className="size-4" />
                        Redactar en el cliente de correo
                      </a>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground self-center text-xs">
                      El contacto de muestra no tiene correo directo.
                    </span>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
