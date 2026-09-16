export type TipoMovimiento = "gasto" | "ingreso";

export interface Movimiento {
  id: string;
  fecha: string; // formato ISO: AAAA-MM-DD
  tipo: TipoMovimiento;
  categoria: string;
  descripcion: string;
  monto: number; // siempre positivo
}

export type Horizonte = 1 | 3 | 6 | 12;

export const HORIZONTES: Horizonte[] = [1, 3, 6, 12];

/**
 * Una meta con nombre (p.ej. "Silla de escritorio"): una compra concreta con su
 * precio y su plazo. A diferencia de la meta general, el plazo en meses es libre.
 */
export interface MetaCustom {
  id: string;
  nombre: string;
  objetivo: number; // precio de la meta
  meses: number; // en cuantos meses la quiero (>= 1)
  ahorrado: number; // lo que ya llevo apartado para esta meta
}

export interface Ajustes {
  ingresoMensual: number; // ingreso fijo estimado por mes
  metaAhorro: number; // cantidad que quiero ahorrar
  horizonteMeses: Horizonte; // en cuantos meses quiero llegar a la meta
  ahorroInicial: number; // lo que ya tengo ahorrado hoy
  categorias: string[]; // categorias de gasto disponibles
  metasCustom: MetaCustom[]; // metas con nombre, ademas de la meta general
}

export interface EstadoApp {
  movimientos: Movimiento[];
  ajustes: Ajustes;
}

export const CATEGORIA_INGRESO = "Ingreso";

/**
 * Cajon de los gastos que entran por CSV: el extracto del banco no trae categoria,
 * y meterlos en la primera de la lista (Vivienda) falsearia el reparto del mes.
 * Desde aqui el usuario los va moviendo a su sitio.
 */
export const CATEGORIA_IMPORTADO = "Importado";

export const CATEGORIAS_POR_DEFECTO: string[] = [
  "Vivienda",
  "Comida",
  "Transporte",
  "Ocio",
  "Salud",
  "Suscripciones",
  "Compras",
  "Otros",
  CATEGORIA_IMPORTADO,
];

export const AJUSTES_POR_DEFECTO: Ajustes = {
  ingresoMensual: 0,
  metaAhorro: 0,
  horizonteMeses: 6,
  ahorroInicial: 0,
  categorias: CATEGORIAS_POR_DEFECTO,
  metasCustom: [],
};
