import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto: existe un package-lock.json más arriba en el
  // árbol de directorios que Next confundiría con el workspace root.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
