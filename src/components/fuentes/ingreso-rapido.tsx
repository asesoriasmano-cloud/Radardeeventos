"use client";

import { useId, useState } from "react";
import {
  CalendarPlus,
  Eraser,
  ImageIcon,
  Info,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import Tesseract from "tesseract.js";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { extraerCampos, type CampoExtraido } from "@/lib/extractor";
import { formatearFecha, formatearNumero, pluralizar } from "@/lib/eventos";
import type { DeteccionManual, Sede } from "@/lib/types";
import { cn } from "@/lib/utils";

interface IngresoRapidoProps {
  sedes: Sede[];
}

type Formulario = {
  titulo: string;
  urlFuente: string;
  sede: string;
  fechaInicio: string;
  fechaFin: string;
  estimadoAsistentes: string;
  contactoNombre: string;
  contactoCargo: string;
  contactoTelefono: string;
  contactoEmail: string;
};

const VACIO: Formulario = {
  titulo: "",
  urlFuente: "",
  sede: "",
  fechaInicio: "",
  fechaFin: "",
  estimadoAsistentes: "",
  contactoNombre: "",
  contactoCargo: "",
  contactoTelefono: "",
  contactoEmail: "",
};

const EJEMPLO = `Expo Proveedores Mineros Calama 2026
Del 12 al 14 de noviembre de 2026 en el Hotel Diego de Almagro Calama.
Se esperan 1.800 asistentes entre proveedores y ejecutivos de faena.
Contacto: Marcela Ríos, coordinadora de eventos.
+56 9 8123 4567 — mrios@expocalama.cl
https://expocalama.cl/2026`;

/**
 * Campo del formulario. Vive fuera de `IngresoRapido` a propósito: declararlo
 * dentro haría que React lo tratara como un componente nuevo en cada tecleo y
 * el input perdería el foco.
 */
function Campo({
  id,
  etiqueta,
  valor,
  onCambio,
  tipo = "text",
  marcador,
  lista,
  requerido,
  resaltado,
  faltante,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  tipo?: string;
  marcador?: string;
  lista?: string;
  requerido?: boolean;
  resaltado?: boolean;
  faltante?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {etiqueta}
        {requerido && <span className="text-urgente ml-0.5">*</span>}
        {resaltado && (
          <Badge
            variant="outline"
            className="text-cat-charla border-cat-charla/40 ml-1 h-4 px-1 text-[10px] font-normal"
          >
            detectado
          </Badge>
        )}
      </Label>
      <Input
        id={id}
        type={tipo}
        list={lista}
        placeholder={marcador}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        className={cn(
          resaltado && "border-cat-charla/50",
          faltante && "border-urgente",
        )}
      />
    </div>
  );
}

export function IngresoRapido({ sedes }: IngresoRapidoProps) {
  const idBase = useId();
  const [pegado, setPegado] = useState("");
  const [formulario, setFormulario] = useState<Formulario>(VACIO);
  const [resaltados, setResaltados] = useState<Set<CampoExtraido>>(new Set());
  const [registros, setRegistros] = useState<DeteccionManual[]>([]);
  const [intentoVacio, setIntentoVacio] = useState(false);
  const [procesandoOCR, setProcesandoOCR] = useState(false);

  async function extraerDeImagen(archivo: File) {
    if (!archivo.type.startsWith("image/")) {
      toast.error("Por favor, pega o carga una imagen.");
      return;
    }

    setProcesandoOCR(true);
    try {
      const worker = await Tesseract.createWorker("spa");
      const resultado = await worker.recognize(archivo);
      await worker.terminate();

      const textoExtraido = resultado.data.text;
      if (!textoExtraido.trim()) {
        toast.warning("No se reconoció texto en la imagen.");
        return;
      }

      const { campos, detectados } = extraerCampos(textoExtraido, sedes);
      setFormulario({
        titulo: campos.titulo ?? "",
        urlFuente: campos.urlFuente ?? "",
        sede: campos.sede ?? "",
        fechaInicio: campos.fechaInicio ?? "",
        fechaFin: campos.fechaFin ?? "",
        estimadoAsistentes: campos.estimadoAsistentes
          ? String(campos.estimadoAsistentes)
          : "",
        contactoNombre: campos.contactoNombre ?? "",
        contactoCargo: campos.contactoCargo ?? "",
        contactoTelefono: campos.contactoTelefono ?? "",
        contactoEmail: campos.contactoEmail ?? "",
      });
      setResaltados(new Set(detectados));

      if (detectados.length === 0) {
        toast.warning(
          "Se extrajo texto pero no se reconocieron campos. Habrá que completarlo a mano.",
        );
      } else {
        toast.success(
          `${pluralizar(detectados.length, "campo")} reconocido${detectados.length === 1 ? "" : "s"} de la imagen.`,
        );
      }
    } catch (error) {
      console.error("Error en OCR:", error);
      toast.error("Error al procesar la imagen. Intenta otra vez.");
    } finally {
      setProcesandoOCR(false);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.classList.add("border-cat-charla", "bg-cat-charla/5");
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.currentTarget.classList.remove("border-cat-charla", "bg-cat-charla/5");
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.classList.remove("border-cat-charla", "bg-cat-charla/5");

    const archivos = e.dataTransfer.files;
    if (archivos.length > 0) {
      extraerDeImagen(archivos[0]);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const archivo = items[i].getAsFile();
        if (archivo) {
          extraerDeImagen(archivo);
        }
        break;
      }
    }
  }

  function actualizar(campo: keyof Formulario, valor: string) {
    setFormulario((estado) => ({ ...estado, [campo]: valor }));
    setResaltados((estado) => {
      if (!estado.has(campo as CampoExtraido)) return estado;
      const copia = new Set(estado);
      copia.delete(campo as CampoExtraido);
      return copia;
    });
  }

  function procesar() {
    if (!pegado.trim()) {
      toast.warning("Pega el aviso o el enlace antes de procesar.");
      return;
    }

    const { campos, detectados } = extraerCampos(pegado, sedes);
    setFormulario({
      titulo: campos.titulo ?? "",
      urlFuente: campos.urlFuente ?? "",
      sede: campos.sede ?? "",
      fechaInicio: campos.fechaInicio ?? "",
      fechaFin: campos.fechaFin ?? "",
      estimadoAsistentes: campos.estimadoAsistentes
        ? String(campos.estimadoAsistentes)
        : "",
      contactoNombre: campos.contactoNombre ?? "",
      contactoCargo: campos.contactoCargo ?? "",
      contactoTelefono: campos.contactoTelefono ?? "",
      contactoEmail: campos.contactoEmail ?? "",
    });
    setResaltados(new Set(detectados));

    if (detectados.length === 0) {
      toast.warning(
        "No se reconoció ningún campo. Habrá que completarlo a mano.",
      );
    } else {
      toast.success(
        `${pluralizar(detectados.length, "campo")} reconocido${detectados.length === 1 ? "" : "s"}. Revísalos antes de registrar.`,
      );
    }
  }

  function registrar() {
    const faltantes = !formulario.titulo.trim() || !formulario.fechaInicio;
    setIntentoVacio(faltantes);
    if (faltantes) {
      toast.error(
        "El nombre del evento y la fecha de inicio son obligatorios.",
      );
      return;
    }

    const aforo = Number(formulario.estimadoAsistentes.replace(/\D/g, ""));

    setRegistros((estado) => [
      {
        id: `det-${Date.now()}`,
        titulo: formulario.titulo.trim(),
        urlFuente: formulario.urlFuente.trim() || undefined,
        sede: formulario.sede.trim() || "Sede por confirmar",
        fechaInicio: formulario.fechaInicio,
        fechaFin: formulario.fechaFin || undefined,
        estimadoAsistentes:
          Number.isFinite(aforo) && aforo > 0 ? aforo : undefined,
        contactoNombre: formulario.contactoNombre.trim() || undefined,
        contactoCargo: formulario.contactoCargo.trim() || undefined,
        contactoTelefono: formulario.contactoTelefono.trim() || undefined,
        contactoEmail: formulario.contactoEmail.trim() || undefined,
        registradoEn: new Date().toISOString(),
      },
      ...estado,
    ]);

    toast.success(
      `"${formulario.titulo.trim()}" quedó en la bandeja de la sesión.`,
    );
    setFormulario(VACIO);
    setResaltados(new Set());
    setPegado("");
  }

  function limpiar() {
    setFormulario(VACIO);
    setResaltados(new Set());
    setPegado("");
    setIntentoVacio(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Pegado y extracción */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="text-muted-foreground size-4" />
            Pega el aviso detectado
          </CardTitle>
          <CardDescription className="text-xs">
            Texto de una cartelera, un correo o el cuerpo de una noticia.
            También sirve pegar solo el enlace y completar el resto a mano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
            className="rounded-md border-2 border-dashed border-muted-foreground/30 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-cat-charla/50"
          >
            <label className="flex cursor-pointer flex-col items-center gap-2">
              <ImageIcon className="text-muted-foreground size-6" />
              <span className="text-center text-xs font-medium">
                {procesandoOCR
                  ? "Extrayendo texto de la imagen…"
                  : "Arrastra una imagen aquí o haz clic para seleccionar"}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={procesandoOCR}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    extraerDeImagen(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          <Textarea
            value={pegado}
            onChange={(evento) => setPegado(evento.target.value)}
            placeholder={EJEMPLO}
            className="min-h-[190px] font-mono text-xs"
            aria-label="Texto o enlace a procesar"
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={procesar} className="gap-2">
              <Sparkles className="size-4" />
              Extraer datos
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPegado(EJEMPLO)}
              className="text-muted-foreground gap-2"
            >
              Usar un ejemplo
            </Button>
          </div>

          <p className="text-muted-foreground bg-muted/40 flex items-start gap-2 rounded-md border p-3 text-xs">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>
              La extracción es un análisis local por patrones —{" "}
              <strong className="font-medium">no hay un modelo detrás</strong>.
              Reconoce fechas, teléfonos chilenos, correos, aforos y sedes del
              catálogo. Todo lo que proponga queda editable antes de
              registrarse.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarPlus className="text-muted-foreground size-4" />
            Ingreso rápido de evento detectado
          </CardTitle>
          <CardDescription className="text-xs">
            Los campos marcados como <span className="italic">detectado</span>{" "}
            vienen del texto pegado. Revísalos: la heurística acierta en avisos
            bien redactados y falla en los ambiguos.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Campo
            id={`${idBase}-titulo`}
            valor={formulario.titulo}
            onCambio={(valor) => actualizar("titulo", valor)}
            etiqueta="Nombre del evento"
            marcador="Expo Proveedores Mineros Calama 2026"
            requerido
            resaltado={resaltados.has("titulo")}
            faltante={intentoVacio && !formulario.titulo}
          />

          <Campo
            id={`${idBase}-urlFuente`}
            valor={formulario.urlFuente}
            onCambio={(valor) => actualizar("urlFuente", valor)}
            etiqueta="URL fuente"
            tipo="url"
            marcador="https://…"
            resaltado={resaltados.has("urlFuente")}
          />

          <div>
            <Campo
              id={`${idBase}-sede`}
              valor={formulario.sede}
              onCambio={(valor) => actualizar("sede", valor)}
              etiqueta="Sede"
              marcador="Hotel, recinto o explanada"
              lista={`${idBase}-sedes`}
              resaltado={resaltados.has("sede")}
            />
            {/* Lista nativa: el catálogo sugiere, pero admite recintos nuevos. */}
            <datalist id={`${idBase}-sedes`}>
              {sedes.map((sede) => (
                <option
                  key={sede.id}
                  value={sede.nombre}
                >{`${sede.comuna}, ${sede.ciudad}`}</option>
              ))}
            </datalist>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo
              id={`${idBase}-fechaInicio`}
              valor={formulario.fechaInicio}
              onCambio={(valor) => actualizar("fechaInicio", valor)}
              etiqueta="Fecha de inicio"
              tipo="date"
              requerido
              resaltado={resaltados.has("fechaInicio")}
              faltante={intentoVacio && !formulario.fechaInicio}
            />
            <Campo
              id={`${idBase}-fechaFin`}
              valor={formulario.fechaFin}
              onCambio={(valor) => actualizar("fechaFin", valor)}
              etiqueta="Fecha de término"
              tipo="date"
              resaltado={resaltados.has("fechaFin")}
            />
            <Campo
              id={`${idBase}-estimadoAsistentes`}
              valor={formulario.estimadoAsistentes}
              onCambio={(valor) => actualizar("estimadoAsistentes", valor)}
              etiqueta="Aforo estimado"
              tipo="number"
              marcador="1800"
              resaltado={resaltados.has("estimadoAsistentes")}
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id={`${idBase}-contactoNombre`}
              valor={formulario.contactoNombre}
              onCambio={(valor) => actualizar("contactoNombre", valor)}
              etiqueta="Nombre del contacto"
              marcador="Marcela Ríos"
              resaltado={resaltados.has("contactoNombre")}
            />
            <Campo
              id={`${idBase}-contactoCargo`}
              valor={formulario.contactoCargo}
              onCambio={(valor) => actualizar("contactoCargo", valor)}
              etiqueta="Rol del contacto"
              marcador="Coordinadora de eventos"
              resaltado={resaltados.has("contactoCargo")}
            />
            <Campo
              id={`${idBase}-contactoTelefono`}
              valor={formulario.contactoTelefono}
              onCambio={(valor) => actualizar("contactoTelefono", valor)}
              etiqueta="Teléfono / Celular"
              tipo="tel"
              marcador="+56 9 8123 4567"
              resaltado={resaltados.has("contactoTelefono")}
            />
            <Campo
              id={`${idBase}-contactoEmail`}
              valor={formulario.contactoEmail}
              onCambio={(valor) => actualizar("contactoEmail", valor)}
              etiqueta="Email"
              tipo="email"
              marcador="contacto@dominio.cl"
              resaltado={resaltados.has("contactoEmail")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={registrar} className="gap-2">
              <CalendarPlus className="size-4" />
              Registrar detección
            </Button>
            <Button
              variant="ghost"
              onClick={limpiar}
              className="text-muted-foreground gap-2"
            >
              <Eraser className="size-4" />
              Limpiar
            </Button>
          </div>

          <p className="text-muted-foreground flex items-start gap-2 text-xs">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            Lo registrado vive solo en esta pestaña: no se agrega al conjunto de
            datos ni aparece en las demás vistas.
          </p>
        </CardContent>
      </Card>

      {/* Bandeja de la sesión */}
      {registros.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">
              Detecciones de esta sesión
              <span className="text-muted-foreground ml-1.5 text-xs tabular-nums">
                ({registros.length})
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Quedarían en cola para validación antes de entrar al radar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {registros.map((registro) => (
                <li key={registro.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-sm font-medium">
                      {registro.titulo}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {registro.sede}
                    </span>
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {formatearFecha(registro.fechaInicio)}
                      {registro.fechaFin &&
                        registro.fechaFin !== registro.fechaInicio &&
                        ` — ${formatearFecha(registro.fechaFin)}`}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {registro.estimadoAsistentes
                      ? `${formatearNumero(registro.estimadoAsistentes)} asistentes estimados`
                      : "Aforo sin estimar"}
                    {" · "}
                    {registro.contactoNombre
                      ? `${registro.contactoNombre}${registro.contactoCargo ? `, ${registro.contactoCargo}` : ""}`
                      : "Sin responsable identificado"}
                    {registro.contactoTelefono &&
                      ` · ${registro.contactoTelefono}`}
                    {registro.contactoEmail && ` · ${registro.contactoEmail}`}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
