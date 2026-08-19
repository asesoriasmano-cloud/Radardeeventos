"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Check,
  Copy,
  Link2,
  Mail,
  MessageCircle,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { enlaceWhatsApp } from "@/lib/eventos";
import type { ContactoClave, Evento } from "@/lib/types";
import { cn } from "@/lib/utils";

function BotonCopiar({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      toast.success(`${etiqueta} copiado`, { description: valor });
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      toast.error("No se pudo copiar", {
        description: "El navegador bloqueó el acceso al portapapeles.",
      });
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={copiar}
          aria-label={`Copiar ${etiqueta.toLowerCase()}`}
        >
          {copiado ? (
            <Check className="text-cat-charla size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copiar {etiqueta.toLowerCase()}</TooltipContent>
    </Tooltip>
  );
}

export function PanelContacto({
  contacto,
  evento,
  className,
}: {
  contacto: ContactoClave;
  evento: Evento;
  className?: string;
}) {
  // lucide ya no distribuye iconos de marca: se usa un icono de enlace
  // genérico y el nombre de la red va en el texto.
  const nombreRed =
    contacto.redSocial?.tipo === "instagram" ? "Instagram" : "LinkedIn";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {contacto.nombreResponsable}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {contacto.cargo}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="mt-0.5 shrink-0">
              {contacto.verificado ? (
                <BadgeCheck className="text-cat-charla size-4" />
              ) : (
                <ShieldAlert className="text-proximo size-4" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {contacto.verificado
              ? "Datos verificados con el organizador"
              : "Datos sin verificar — confirmar antes de usar"}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <Phone className="text-muted-foreground size-3.5 shrink-0" />
          {contacto.telefonoCelular ? (
            <>
              <a
                href={`tel:${contacto.telefonoCelular.replace(/\s/g, "")}`}
                className="hover:text-primary flex-1 truncate tabular-nums transition-colors"
              >
                {contacto.telefonoCelular}
              </a>
              <BotonCopiar
                valor={contacto.telefonoCelular}
                etiqueta="Teléfono"
              />
            </>
          ) : (
            <span className="text-muted-foreground flex-1 text-xs italic">
              Celular no detectado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Mail className="text-muted-foreground size-3.5 shrink-0" />
          {contacto.email ? (
            <>
              <a
                href={`mailto:${contacto.email}`}
                className="hover:text-primary flex-1 truncate transition-colors"
              >
                {contacto.email}
              </a>
              <BotonCopiar valor={contacto.email} etiqueta="Correo" />
            </>
          ) : (
            <span className="text-muted-foreground flex-1 text-xs italic">
              Correo directo no detectado
            </span>
          )}
        </div>

        {contacto.redSocial && (
          <div className="flex items-center gap-2">
            <Link2 className="text-muted-foreground size-3.5 shrink-0" />
            <a
              href={contacto.redSocial.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary flex-1 truncate transition-colors"
            >
              <span className="text-muted-foreground">{nombreRed} ·</span>{" "}
              {contacto.redSocial.url.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </div>
        )}
      </div>

      {contacto.telefonoCelular ? (
        <Button asChild size="sm" className="w-full gap-2">
          <a
            href={enlaceWhatsApp(contacto, evento)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4" />
            Escribir por WhatsApp
          </a>
        </Button>
      ) : (
        <Button size="sm" className="w-full gap-2" disabled>
          <MessageCircle className="size-4" />
          Sin celular para WhatsApp
        </Button>
      )}
    </div>
  );
}
