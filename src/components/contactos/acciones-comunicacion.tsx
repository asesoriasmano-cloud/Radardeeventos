"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  enlaceCorreo,
  enlaceTelefono,
  enlaceWhatsAppDirectorio,
  type OrganizadorEnriquecido,
} from "@/lib/directorio";
import type { ContactoClave } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AccionProps {
  href?: string;
  etiqueta: string;
  motivoInactivo: string;
  icono: typeof Phone;
  className?: string;
  nuevaPestana?: boolean;
}

function Accion({
  href,
  etiqueta,
  motivoInactivo,
  icono: Icono,
  className,
  nuevaPestana,
}: AccionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={cn("size-8", className)}
          >
            <a
              href={href}
              aria-label={etiqueta}
              {...(nuevaPestana
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <Icono className="size-4" />
            </a>
          </Button>
        ) : (
          <span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled
              aria-label={motivoInactivo}
            >
              <Icono className="size-4" />
            </Button>
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent>{href ? etiqueta : motivoInactivo}</TooltipContent>
    </Tooltip>
  );
}

/** Llamar, escribir por WhatsApp o enviar correo sin salir de la fila. */
export function AccionesComunicacion({
  contacto,
  ficha,
  className,
}: {
  contacto: ContactoClave;
  ficha: OrganizadorEnriquecido;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Accion
        href={enlaceTelefono(contacto)}
        etiqueta={`Llamar a ${contacto.nombreResponsable}`}
        motivoInactivo="Sin celular registrado"
        icono={Phone}
      />
      <Accion
        href={enlaceWhatsAppDirectorio(contacto, ficha)}
        etiqueta="Abrir chat de WhatsApp"
        motivoInactivo="Sin celular para WhatsApp"
        icono={MessageCircle}
        className="hover:text-cat-charla"
        nuevaPestana
      />
      <Accion
        href={enlaceCorreo(contacto, ficha)}
        etiqueta="Redactar correo con asunto precargado"
        motivoInactivo="Sin correo directo registrado"
        icono={Mail}
      />
    </div>
  );
}
