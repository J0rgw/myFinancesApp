import { motion, useTransform } from 'motion/react'
import type { ReactNode } from 'react'
import { useScrollPantalla } from './Screen'
import s from './NavBar.module.css'

interface Props {
  titulo: string
  accion?: ReactNode
}

/**
 * La barra fija de arriba.
 *
 * Con scrollY en 0 es totalmente transparente: sin material y sin pelo de
 * separacion. Solo aparecen cuando hay contenido pasando por debajo. Una barra
 * desenfocada de forma permanente no es iOS.
 *
 * El titulo pequeño entra justo cuando el titulo grande (que lo pinta <Screen>
 * dentro del scroller) se esta yendo por arriba.
 */
export function NavBar({ titulo, accion }: Props) {
  const scrollY = useScrollPantalla()

  const opacidadMaterial = useTransform(scrollY, [0, 12], [0, 1])
  const opacidadTitulo = useTransform(scrollY, [30, 52], [0, 1])

  return (
    <div className={s.barra}>
      <motion.div
        className={s.material}
        style={{ opacity: opacidadMaterial }}
        aria-hidden
      />
      <div className={s.fila}>
        <motion.span className={s.titulo} style={{ opacity: opacidadTitulo }} aria-hidden>
          {titulo}
        </motion.span>
        {accion ? <div className={s.accion}>{accion}</div> : null}
      </div>
    </div>
  )
}
