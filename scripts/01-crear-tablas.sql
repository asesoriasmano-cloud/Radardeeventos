-- Crear tablas para Radar de Eventos
-- Ejecutar en: Supabase > SQL Editor

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SEDES
CREATE TABLE IF NOT EXISTS sedes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  comuna TEXT,
  region TEXT,
  direccion TEXT,
  lat FLOAT,
  lng FLOAT,
  capacidad_maxima INTEGER,
  telefono_eventos TEXT,
  email_eventos TEXT,
  sitio_web TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANIZADORES
CREATE TABLE IF NOT EXISTS organizadores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  rubro TEXT,
  tipo TEXT NOT NULL,
  sitio_web TEXT,
  notas_internas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTACTOS CLAVE
CREATE TABLE IF NOT EXISTS contactos_clave (
  id TEXT PRIMARY KEY,
  organizador_id TEXT NOT NULL REFERENCES organizadores(id) ON DELETE CASCADE,
  nombre_responsable TEXT NOT NULL,
  cargo TEXT,
  telefono_celular TEXT,
  email TEXT,
  red_social_tipo TEXT,
  red_social_url TEXT,
  verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUENTES
CREATE TABLE IF NOT EXISTS fuentes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  familia TEXT NOT NULL,
  mecanismo TEXT NOT NULL,
  estado TEXT DEFAULT 'activa',
  cadencia_minutos INTEGER,
  cobertura TEXT,
  anticipacion_tipica TEXT,
  ultima_ejecucion TIMESTAMPTZ,
  ultimo_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTOS
CREATE TABLE IF NOT EXISTS eventos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL,
  estado TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estimado_asistentes INTEGER,
  sede_id TEXT NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
  organizador_id TEXT NOT NULL REFERENCES organizadores(id) ON DELETE RESTRICT,
  fuente_id TEXT REFERENCES fuentes(id) ON DELETE SET NULL,
  es_pago BOOLEAN DEFAULT FALSE,
  url_oficial TEXT,
  etiquetas TEXT,
  detectado_en TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RELACIÓN: EVENTO -> CONTACTOS (muchos-a-muchos)
CREATE TABLE IF NOT EXISTS evento_contactos (
  evento_id TEXT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  contacto_id TEXT NOT NULL REFERENCES contactos_clave(id) ON DELETE CASCADE,
  PRIMARY KEY (evento_id, contacto_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_inicio ON eventos(fecha_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_ciudad ON eventos(sede_id);
CREATE INDEX IF NOT EXISTS idx_eventos_organizador ON eventos(organizador_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fuente ON eventos(fuente_id);
CREATE INDEX IF NOT EXISTS idx_eventos_detectado ON eventos(detectado_en DESC);
CREATE INDEX IF NOT EXISTS idx_contactos_organizador ON contactos_clave(organizador_id);
CREATE INDEX IF NOT EXISTS idx_sedes_ciudad ON sedes(ciudad);

-- RLS: Permitir lectura pública (anon)
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos_clave ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento_contactos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública sedes" ON sedes
  FOR SELECT USING (true);

CREATE POLICY "Lectura pública organizadores" ON organizadores
  FOR SELECT USING (true);

CREATE POLICY "Lectura pública contactos" ON contactos_clave
  FOR SELECT USING (true);

CREATE POLICY "Lectura pública fuentes" ON fuentes
  FOR SELECT USING (true);

CREATE POLICY "Lectura pública eventos" ON eventos
  FOR SELECT USING (true);

CREATE POLICY "Lectura pública evento_contactos" ON evento_contactos
  FOR SELECT USING (true);

-- Permitir inserciones (para ingesta automática)
CREATE POLICY "Insertar eventos" ON eventos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Insertar sedes" ON sedes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Insertar organizadores" ON organizadores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Insertar contactos" ON contactos_clave
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Insertar evento_contactos" ON evento_contactos
  FOR INSERT WITH CHECK (true);
