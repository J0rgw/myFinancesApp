import { mesActual } from './format'
import { AJUSTES_POR_DEFECTO, CATEGORIA_INGRESO, type EstadoApp } from './types'

/** Synthetic, repeatable figures. Dates follow the current month, never random. */
export function crearDemo(mes = mesActual()): EstadoApp {
  const ejemplos: [string, string, string, number][] = [
    ['01', CATEGORIA_INGRESO, 'Demo · Nómina / Salary', 2800],
    ['02', 'Vivienda', 'Demo · Alquiler / Rent', 850],
    ['03', 'Comida', 'Demo · Supermercado / Groceries', 124.5],
    ['05', 'Transporte', 'Demo · Abono transporte / Transit pass', 45],
    ['07', 'Suscripciones', 'Demo · Música / Music', 10.99],
    ['10', 'Salud', 'Demo · Farmacia / Pharmacy', 24.9],
    ['12', 'Ocio', 'Demo · Cine / Cinema', 28],
    ['15', 'Comida', 'Demo · Supermercado / Groceries', 96.35],
    ['18', CATEGORIA_INGRESO, 'Demo · Proyecto puntual / Side project', 200],
    ['20', 'Compras', 'Demo · Libros / Books', 42],
    ['23', 'Vivienda', 'Demo · Suministros / Utilities', 95],
    ['26', 'Otros', 'Demo · Regalo / Gift', 35],
  ]

  return {
    movimientos: ejemplos.map(([dia, categoria, descripcion, monto], i) => ({
      id: `demo-${mes}-${i + 1}`,
      fecha: `${mes}-${dia}`,
      tipo: categoria === CATEGORIA_INGRESO ? 'ingreso' : 'gasto',
      categoria,
      descripcion,
      monto,
    })),
    ajustes: {
      ...AJUSTES_POR_DEFECTO,
      categorias: [...AJUSTES_POR_DEFECTO.categorias],
      ingresoMensual: 2800,
      ahorroInicial: 1200,
      metaAhorro: 6000,
      horizonteMeses: 6,
      metasCustom: [{
        id: 'demo-laptop',
        nombre: 'Demo · Portátil / Laptop',
        objetivo: 1200,
        meses: 12,
        ahorrado: 240,
      }],
    },
  }
}
