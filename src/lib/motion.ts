import type { Transition } from 'motion/react'

/*
 * Muelles compartidos.
 *
 * Se usan visualDuration + bounce en vez de stiffness + damping a proposito:
 * separan "cuanto dura" de "cuanto rebota", que es justo el eje que se toca al
 * ajustar el tacto. Con stiffness/damping cada cambio de rebote altera tambien
 * la duracion y acabas persiguiendote la cola.
 */

/** Sheet que sube desde abajo. */
export const muelleSheet: Transition = {
  type: 'spring',
  visualDuration: 0.4,
  bounce: 0.15,
}

/** Navegacion push/pop entre pantallas. Sin rebote, como UIKit. */
export const muellePush: Transition = {
  type: 'spring',
  visualDuration: 0.35,
  bounce: 0,
}

/** Respuesta al tocar un boton o una tarjeta. Corto y con vida. */
export const muelleToque: Transition = {
  type: 'spring',
  visualDuration: 0.15,
  bounce: 0.3,
}

/** El anillo de gasto y los numeros que cuentan. Lento y con poco rebote. */
export const muelleAnillo: Transition = {
  type: 'spring',
  visualDuration: 0.9,
  bounce: 0.1,
}

/** Barras de categoria al entrar. */
export const muelleBarra: Transition = {
  type: 'spring',
  visualDuration: 0.6,
  bounce: 0.12,
}

/** El control segmentado moviendo su pastilla. */
export const muellePastilla: Transition = {
  type: 'spring',
  visualDuration: 0.3,
  bounce: 0.1,
}

/**
 * Las pestañas de iOS no tienen transicion. Un deslizamiento horizontal entre
 * Panel y Gastos delata una app web al instante. Como mucho, un fundido corto.
 */
export const fundidoPestana: Transition = {
  duration: 0.12,
  ease: 'easeOut',
}

/** El destello de una fila al tocarla: instantaneo al bajar, se apaga al soltar. */
export const DURACION_RESALTE = 0.25
