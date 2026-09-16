import type { ReactNode } from 'react'
import s from './InsetGroup.module.css'

interface Props {
  /** Cabecera en mayusculas, como en Ajustes. */
  titulo?: string
  /** Texto explicativo debajo del grupo. */
  pie?: ReactNode
  children: ReactNode
}

/**
 * El grupo de lista con sangria de iOS: tarjeta redondeada con margen lateral.
 *
 * Los separadores entre filas los pinta <Row>, no este componente, porque la regla
 * de "la ultima fila no lleva separador" se resuelve con :last-child.
 */
export function InsetGroup({ titulo, pie, children }: Props) {
  return (
    <section className={s.grupo}>
      {titulo ? <h2 className={s.cabecera}>{titulo}</h2> : null}
      <div className={s.tarjeta}>{children}</div>
      {pie ? <p className={s.pie}>{pie}</p> : null}
    </section>
  )
}
