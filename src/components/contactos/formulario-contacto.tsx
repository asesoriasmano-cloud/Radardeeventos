"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactoClave, RedSocial } from "@/lib/types";

export interface BorradorContacto {
  nombreResponsable: string;
  cargo: string;
  telefonoCelular: string;
  email: string;
  redSocialTipo: RedSocial;
  redSocialUrl: string;
  verificado: boolean;
}

function aBorrador(contacto?: ContactoClave): BorradorContacto {
  return {
    nombreResponsable: contacto?.nombreResponsable ?? "",
    cargo: contacto?.cargo ?? "",
    telefonoCelular: contacto?.telefonoCelular ?? "",
    email: contacto?.email ?? "",
    redSocialTipo: contacto?.redSocial?.tipo ?? "linkedin",
    redSocialUrl: contacto?.redSocial?.url ?? "",
    verificado: contacto?.verificado ?? false,
  };
}

interface FormularioContactoProps {
  /** Ausente = alta de un contacto secundario nuevo. */
  contacto?: ContactoClave;
  onGuardar: (borrador: BorradorContacto) => void;
  onCancelar: () => void;
}

export function FormularioContacto({
  contacto,
  onGuardar,
  onCancelar,
}: FormularioContactoProps) {
  const [borrador, setBorrador] = useState<BorradorContacto>(() =>
    aBorrador(contacto),
  );
  const [tocado, setTocado] = useState(false);

  const nombreValido = borrador.nombreResponsable.trim().length > 1;
  const cargoValido = borrador.cargo.trim().length > 1;
  // Un contacto sin celular ni correo no sirve para nada: se exige al menos uno.
  const tieneVia = Boolean(
    borrador.telefonoCelular.trim() || borrador.email.trim(),
  );
  const emailValido =
    borrador.email.trim() === "" ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(borrador.email);

  const valido = nombreValido && cargoValido && tieneVia && emailValido;

  function actualizar<C extends keyof BorradorContacto>(
    campo: C,
    valor: BorradorContacto[C],
  ) {
    setBorrador((previo) => ({ ...previo, [campo]: valor }));
  }

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setTocado(true);
    if (!valido) return;
    onGuardar(borrador);
  }

  return (
    <form
      onSubmit={enviar}
      className="bg-muted/30 space-y-3 rounded-lg border p-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre del responsable</Label>
          <Input
            id="nombre"
            value={borrador.nombreResponsable}
            onChange={(e) => actualizar("nombreResponsable", e.target.value)}
            placeholder="Ej: María Fernanda Rojas"
            aria-invalid={tocado && !nombreValido}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            value={borrador.cargo}
            onChange={(e) => actualizar("cargo", e.target.value)}
            placeholder="Ej: Coordinadora de Eventos"
            aria-invalid={tocado && !cargoValido}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="celular">Teléfono celular</Label>
          <Input
            id="celular"
            value={borrador.telefonoCelular}
            onChange={(e) => actualizar("telefonoCelular", e.target.value)}
            placeholder="+56 9 0000 0000"
            inputMode="tel"
            aria-invalid={tocado && !tieneVia}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Correo directo</Label>
          <Input
            id="email"
            value={borrador.email}
            onChange={(e) => actualizar("email", e.target.value)}
            placeholder="nombre@empresa.cl"
            inputMode="email"
            aria-invalid={tocado && (!tieneVia || !emailValido)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="red">Red social</Label>
          <Select
            value={borrador.redSocialTipo}
            onValueChange={(valor) =>
              actualizar("redSocialTipo", valor as RedSocial)
            }
          >
            <SelectTrigger id="red" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="red-url">URL del perfil</Label>
          <Input
            id="red-url"
            value={borrador.redSocialUrl}
            onChange={(e) => actualizar("redSocialUrl", e.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
        </div>
      </div>

      <Label className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
        <Checkbox
          checked={borrador.verificado}
          onCheckedChange={(valor) => actualizar("verificado", valor === true)}
        />
        Datos confirmados directamente con el organizador
      </Label>

      {tocado && !valido && (
        <p className="text-urgente text-xs">
          {!nombreValido || !cargoValido
            ? "Nombre y cargo son obligatorios."
            : !emailValido
              ? "El correo no tiene un formato válido."
              : "Se necesita al menos un celular o un correo para poder contactar."}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancelar}>
          <X className="size-4" />
          Cancelar
        </Button>
        <Button type="submit" size="sm">
          <Save className="size-4" />
          {contacto ? "Guardar cambios" : "Agregar contacto"}
        </Button>
      </div>
    </form>
  );
}
