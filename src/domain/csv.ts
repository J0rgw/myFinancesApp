import Papa from "papaparse";
import { CATEGORIA_INGRESO, Movimiento } from "./types";
import { nuevoId } from "./id";

export interface CsvCargado {
  columnas: string[];
  filas: Record<string, string>[];
}

export interface MapeoColumnas {
  fecha: string;
  descripcion: string;
  importe: string;
  categoriaPorDefecto: string;
}

export function leerCsv(texto: string): CsvCargado {
  const resultado = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: true,
    delimiter: "", // deteccion automatica del separador
    transformHeader: (h) => h.trim(),
  });
  const filas = (resultado.data || []).filter((f) =>
    Object.values(f).some((v) => String(v).trim() !== "")
  );
  const columnas = resultado.meta.fields ? resultado.meta.fields.map((c) => c.trim()) : [];
  return { columnas, filas };
}

// Convierte un texto de importe con formato europeo o ingles a numero
export function parseImporte(bruto: string): number {
  if (bruto == null) return NaN;
  let s = String(bruto).trim();
  if (s === "") return NaN;
  s = s.replace(/\s/g, "").replace(/€/g, "").replace(/eur/gi, "");
  const tieneComa = s.includes(",");
  const tienePunto = s.includes(".");
  if (tieneComa && tienePunto) {
    // el ultimo separador es el decimal
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (tieneComa) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}

// Normaliza una fecha a formato ISO AAAA-MM-DD
export function parseFecha(bruto: string): string {
  const s = String(bruto || "").trim();
  if (!s) return "";
  // ya viene en ISO
  const iso = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // formato dia/mes/anio o dia-mes-anio
  const eu = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (eu) {
    let anio = eu[3];
    if (anio.length === 2) anio = "20" + anio;
    const mes = eu[2].padStart(2, "0");
    const dia = eu[1].padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
  return "";
}

// Intenta adivinar que columna corresponde a cada campo
export function adivinarMapeo(columnas: string[]): Partial<MapeoColumnas> {
  const buscar = (claves: string[]) =>
    columnas.find((c) => claves.some((k) => c.toLowerCase().includes(k)));
  return {
    fecha: buscar(["fecha", "date"]) || columnas[0],
    descripcion:
      buscar(["concepto", "descrip", "detalle", "concept", "description"]) || columnas[1],
    importe:
      buscar(["importe", "cantidad", "monto", "amount", "importe (eur)"]) ||
      columnas[columnas.length - 1],
  };
}

export interface FilaImportada {
  movimiento: Movimiento;
  valido: boolean;
}

export function construirMovimientos(
  carga: CsvCargado,
  mapeo: MapeoColumnas
): FilaImportada[] {
  return carga.filas.map((fila) => {
    const fecha = parseFecha(fila[mapeo.fecha]);
    const importe = parseImporte(fila[mapeo.importe]);
    const descripcion = String(fila[mapeo.descripcion] || "").trim() || "Sin descripción";
    const valido = fecha !== "" && !isNaN(importe) && importe !== 0;
    const monto = Math.abs(importe);
    const tipo = importe < 0 ? "gasto" : "ingreso";
    return {
      valido,
      movimiento: {
        id: nuevoId(),
        fecha: fecha || "",
        tipo,
        categoria: tipo === "ingreso" ? CATEGORIA_INGRESO : mapeo.categoriaPorDefecto,
        descripcion,
        monto,
      },
    };
  });
}
