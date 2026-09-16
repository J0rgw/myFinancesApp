import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { muelleToque } from '@/lib/motion'
import { haptic } from '@/lib/hooks/useHaptic'
import s from './Button.module.css'

type Variante = 'relleno' | 'gris' | 'destructivo' | 'plano'

interface Props {
  children: ReactNode
  onClick?: () => void
  variante?: Variante
  disabled?: boolean
  /** En los botones planos de barra: negrita para la accion principal ("Listo"). */
  enfasis?: boolean
  type?: 'button' | 'submit'
}

/**
 * A diferencia de <Row>, los botones SI se escalan al tocarlos. Es la distincion
 * de iOS: las filas destellan un relleno, los botones y las tarjetas responden
 * con un muelle.
 */
export function Button({
  children,
  onClick,
  variante = 'relleno',
  disabled,
  enfasis,
  type = 'button',
}: Props) {
  return (
    <motion.button
      type={type}
      className={`${s.boton} ${s[variante]}`}
      data-enfasis={enfasis ? 'true' : undefined}
      disabled={disabled}
      onClick={
        onClick
          ? () => {
              haptic()
              onClick()
            }
          : undefined
      }
      whileTap={disabled ? undefined : { scale: 0.97, opacity: 0.6 }}
      transition={muelleToque}
    >
      {children}
    </motion.button>
  )
}
