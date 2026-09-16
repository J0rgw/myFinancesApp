import { Ajustes, MetaCustom, Movimiento } from "./types";
import { claveMes } from "./format";

export interface ResumenMes {
  clave: string;
  ingresosReales: number;
  ingresoReferencia: number;
  gastos: number;
  /** Lo que exige al mes solo la meta general (la de "quiero llegar a"). */
  ahorroObjetivoMensual: number;
  /** Lo que exigen al mes, sumadas, todas las metas con nombre. */
  ahorroCustomMensual: number;
  /** ahorroObjetivoMensual + ahorroCustomMensual: todo lo que hay que apartar al mes. */
  ahorroMensualTotal: number;
  /** Ingreso menos el ahorro total. Puede ser negativo si las metas no caben en el ingreso. */
  presupuestoBruto: number;
  /** presupuestoBruto pero nunca por debajo de cero. Es el que se muestra. */
  presupuestoGasto: number;
  presupuestoPorcentaje: number;
  porcentajeIngresoGastado: number;
  porcentajePresupuestoGastado: number;
  restantePresupuesto: number;
  ahorroDelMes: number;
  /** No hay ingreso con el que calcular nada: la app esta sin configurar. */
  sinIngreso: boolean;
  /**
   * El ahorro mensual que exige la meta supera al ingreso, asi que el presupuesto
   * real es negativo. Sin esta bandera el presupuesto se queda clavado en cero y
   * porcentajePresupuestoGastado vale 0, que es indistinguible de no haber gastado
   * nada. La interfaz tiene que contar este caso, no pintar el numero a secas.
   */
  metaInalcanzable: boolean;
}

/** Una meta con nombre resuelta: cuanto falta, cuanto al mes y que parte del ingreso se lleva. */
export interface MetaCustomCalculada {
  meta: MetaCustom;
  /** Lo que falta por reunir: precio menos lo ya ahorrado, nunca negativo. */
  falta: number;
  /** Lo que hay que apartar cada mes para llegar a tiempo. */
  mensual: number;
  /** Porcentaje del ingreso que se lleva esta meta. */
  porcentajeIngreso: number;
  /** Ya esta reunido lo que costaba. */
  completada: boolean;
}

export interface GastoPorCategoria {
  categoria: string;
  total: number;
  porcentajeIngreso: number;
  porcentajePresupuesto: number;
  porcentajeGasto: number;
}

function suma(lista: Movimiento[]): number {
  return lista.reduce((acc, m) => acc + m.monto, 0);
}

export function movimientosDelMes(movimientos: Movimiento[], clave: string): Movimiento[] {
  return movimientos.filter((m) => claveMes(m.fecha) === clave);
}

export function ahorroObjetivoMensual(ajustes: Ajustes): number {
  const faltaParaMeta = Math.max(0, ajustes.metaAhorro - ajustes.ahorroInicial);
  return ajustes.horizonteMeses > 0 ? faltaParaMeta / ajustes.horizonteMeses : 0;
}

/** Lo que exige al mes una meta con nombre: lo que le falta repartido en su plazo. */
export function mensualMetaCustom(meta: MetaCustom): number {
  const falta = Math.max(0, meta.objetivo - meta.ahorrado);
  return meta.meses > 0 ? falta / meta.meses : 0;
}

/** Suma del ahorro mensual que piden todas las metas con nombre. */
export function ahorroCustomMensual(ajustes: Ajustes): number {
  return (ajustes.metasCustom ?? []).reduce((acc, m) => acc + mensualMetaCustom(m), 0);
}

/** Todo lo que hay que apartar al mes: la meta general mas las metas con nombre. */
export function ahorroMensualTotal(ajustes: Ajustes): number {
  return ahorroObjetivoMensual(ajustes) + ahorroCustomMensual(ajustes);
}

/**
 * Cada meta con nombre resuelta contra un ingreso dado, para pintarlas en la lista:
 * cuanto falta, cuanto al mes y que porcentaje del ingreso se lleva.
 */
export function metasCustomCalculadas(
  ajustes: Ajustes,
  ingreso: number
): MetaCustomCalculada[] {
  return (ajustes.metasCustom ?? []).map((meta) => {
    const falta = Math.max(0, meta.objetivo - meta.ahorrado);
    const mensual = meta.meses > 0 ? falta / meta.meses : 0;
    return {
      meta,
      falta,
      mensual,
      porcentajeIngreso: ingreso > 0 ? (mensual / ingreso) * 100 : 0,
      completada: falta <= 0,
    };
  });
}

export function resumenDelMes(
  movimientos: Movimiento[],
  ajustes: Ajustes,
  clave: string
): ResumenMes {
  const delMes = movimientosDelMes(movimientos, clave);
  const ingresosReales = suma(delMes.filter((m) => m.tipo === "ingreso"));
  const gastos = suma(delMes.filter((m) => m.tipo === "gasto"));
  const ingresoReferencia = ingresosReales > 0 ? ingresosReales : ajustes.ingresoMensual;

  const objetivoGeneral = ahorroObjetivoMensual(ajustes);
  const objetivoCustom = ahorroCustomMensual(ajustes);
  const objetivoTotal = objetivoGeneral + objetivoCustom;

  // El presupuesto se deriva de TODO lo que se aparta: la meta general y las metas
  // con nombre compiten por el mismo ingreso.
  const presupuestoBruto = ingresoReferencia - objetivoTotal;
  const presupuestoGasto = Math.max(0, presupuestoBruto);

  const presupuestoPorcentaje =
    ingresoReferencia > 0 ? (presupuestoGasto / ingresoReferencia) * 100 : 0;
  const porcentajeIngresoGastado =
    ingresoReferencia > 0 ? (gastos / ingresoReferencia) * 100 : 0;
  const porcentajePresupuestoGastado =
    presupuestoGasto > 0 ? (gastos / presupuestoGasto) * 100 : 0;

  return {
    clave,
    ingresosReales,
    ingresoReferencia,
    gastos,
    ahorroObjetivoMensual: objetivoGeneral,
    ahorroCustomMensual: objetivoCustom,
    ahorroMensualTotal: objetivoTotal,
    presupuestoBruto,
    presupuestoGasto,
    presupuestoPorcentaje,
    porcentajeIngresoGastado,
    porcentajePresupuestoGastado,
    restantePresupuesto: presupuestoGasto - gastos,
    ahorroDelMes: ingresoReferencia - gastos,
    sinIngreso: ingresoReferencia <= 0,
    metaInalcanzable: ingresoReferencia > 0 && presupuestoBruto < 0,
  };
}

export function gastosPorCategoria(
  movimientos: Movimiento[],
  clave: string,
  resumen: ResumenMes
): GastoPorCategoria[] {
  const delMes = movimientosDelMes(movimientos, clave).filter((m) => m.tipo === "gasto");
  const mapa = new Map<string, number>();
  for (const m of delMes) {
    mapa.set(m.categoria, (mapa.get(m.categoria) || 0) + m.monto);
  }
  const total = resumen.gastos;
  const lista: GastoPorCategoria[] = [];
  for (const [categoria, monto] of mapa.entries()) {
    lista.push({
      categoria,
      total: monto,
      porcentajeIngreso:
        resumen.ingresoReferencia > 0 ? (monto / resumen.ingresoReferencia) * 100 : 0,
      porcentajePresupuesto:
        resumen.presupuestoGasto > 0 ? (monto / resumen.presupuestoGasto) * 100 : 0,
      porcentajeGasto: total > 0 ? (monto / total) * 100 : 0,
    });
  }
  return lista.sort((a, b) => b.total - a.total);
}

export interface PuntoAhorro {
  clave: string;
  ahorro: number;
  acumulado: number;
}

// Ahorro real por mes (ingresos reales menos gastos) y acumulado partiendo del ahorro inicial
export function historialAhorro(
  movimientos: Movimiento[],
  ajustes: Ajustes
): PuntoAhorro[] {
  const meses = new Set<string>();
  for (const m of movimientos) meses.add(claveMes(m.fecha));
  const ordenados = Array.from(meses).sort();
  let acumulado = ajustes.ahorroInicial;
  const puntos: PuntoAhorro[] = [];
  for (const clave of ordenados) {
    const r = resumenDelMes(movimientos, ajustes, clave);
    const ahorro = r.ingresosReales - r.gastos;
    acumulado += ahorro;
    puntos.push({ clave, ahorro, acumulado });
  }
  return puntos;
}

export interface Proyeccion {
  ahorroPromedioMensual: number;
  ahorroActual: number;
  mesesEstimados: number | null;
  cumpleObjetivo: boolean;
  faltaParaMeta: number;
  /** Progreso hacia la meta, 0-100. */
  porcentajeMeta: number;
}

export function proyeccion(
  movimientos: Movimiento[],
  ajustes: Ajustes
): Proyeccion {
  const historial = historialAhorro(movimientos, ajustes);
  const conAhorro = historial.filter((p) => p.ahorro !== 0);
  const ahorroPromedioMensual =
    conAhorro.length > 0
      ? conAhorro.reduce((a, p) => a + p.ahorro, 0) / conAhorro.length
      : 0;

  const ahorroActual =
    historial.length > 0 ? historial[historial.length - 1].acumulado : ajustes.ahorroInicial;
  const faltaParaMeta = Math.max(0, ajustes.metaAhorro - ahorroActual);

  let mesesEstimados: number | null = null;
  if (faltaParaMeta <= 0) {
    mesesEstimados = 0;
  } else if (ahorroPromedioMensual > 0) {
    mesesEstimados = Math.ceil(faltaParaMeta / ahorroPromedioMensual);
  }

  return {
    ahorroPromedioMensual,
    ahorroActual,
    mesesEstimados,
    cumpleObjetivo: ahorroPromedioMensual >= ahorroObjetivoMensual(ajustes),
    faltaParaMeta,
    porcentajeMeta:
      ajustes.metaAhorro > 0
        ? Math.min(100, Math.max(0, (ahorroActual / ajustes.metaAhorro) * 100))
        : 0,
  };
}
