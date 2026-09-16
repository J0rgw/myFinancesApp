import {
  ArrowDown,
  Bank,
  Car,
  Cart,
  Film,
  ForkKnife,
  Health,
  House,
  More,
  Repeat,
  type IconComponent,
} from "reicon-react";
import { CATEGORIA_IMPORTADO, CATEGORIA_INGRESO } from "./types";

export interface Categoria {
  /** Nombre tal y como se guarda en el movimiento. */
  nombre: string;
  icono: IconComponent;
  /**
   * Nombre de la variable CSS, no un color. El color hay que resolverlo en CSS
   * (`var(--cat-comida)`): si se pasa un hex desde JS al SVG, el modo oscuro
   * deja de funcionar sin que se note.
   */
  varColor: string;
}

const POR_NOMBRE: Record<string, Categoria> = {
  Vivienda: { nombre: "Vivienda", icono: House, varColor: "--cat-vivienda" },
  Comida: { nombre: "Comida", icono: ForkKnife, varColor: "--cat-comida" },
  Transporte: { nombre: "Transporte", icono: Car, varColor: "--cat-transporte" },
  Ocio: { nombre: "Ocio", icono: Film, varColor: "--cat-ocio" },
  Salud: { nombre: "Salud", icono: Health, varColor: "--cat-salud" },
  Suscripciones: { nombre: "Suscripciones", icono: Repeat, varColor: "--cat-suscripciones" },
  Compras: { nombre: "Compras", icono: Cart, varColor: "--cat-compras" },
  Otros: { nombre: "Otros", icono: More, varColor: "--cat-otros" },
  [CATEGORIA_IMPORTADO]: {
    nombre: CATEGORIA_IMPORTADO,
    icono: Bank,
    varColor: "--cat-importado",
  },
  [CATEGORIA_INGRESO]: {
    nombre: CATEGORIA_INGRESO,
    icono: ArrowDown,
    varColor: "--cat-ingreso",
  },
};

const DESCONOCIDA: Omit<Categoria, "nombre"> = {
  icono: More,
  varColor: "--cat-otros",
};

/**
 * Las categorias son texto libre (el usuario puede escribir cualquiera al importar),
 * asi que esto siempre devuelve algo en vez de fallar.
 */
export function categoria(nombre: string): Categoria {
  return POR_NOMBRE[nombre] ?? { nombre, ...DESCONOCIDA };
}

export function colorCategoria(nombre: string): string {
  return `var(${categoria(nombre).varColor})`;
}
