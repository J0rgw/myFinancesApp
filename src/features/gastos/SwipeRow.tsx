import { useRef, type ReactNode } from 'react'
import { animate, motion, useMotionValue, type PanInfo } from 'motion/react'
import { Trash } from 'reicon-react'
import { muellePush } from '@/lib/motion'
import { haptic } from '@/lib/hooks/useHaptic'
import s from './SwipeRow.module.css'

const ANCHO = 80

/**
 * Fila que se desliza a la izquierda para descubrir "borrar", como las listas de
 * iOS.
 *
 * touch-action: pan-y en la parte que se arrastra deja que el scroll vertical de
 * la lista siga funcionando: sin eso, los dos gestos se pelean.
 */
export function SwipeRow({ onBorrar, children }: { onBorrar: () => void; children: ReactNode }) {
  const x = useMotionValue(0)
  const abierta = useRef(false)

  const alSoltar = (_e: unknown, info: PanInfo) => {
    // Igual que en el sheet: la velocidad manda sobre la distancia, para que un
    // gesto rapido y corto tambien abra.
    const abrir = info.velocity.x < -300 || info.offset.x < -ANCHO / 2
    abierta.current = abrir
    animate(x, abrir ? -ANCHO : 0, muellePush)
    if (abrir) haptic()
  }

  return (
    <div className={s.envoltorio} style={{ ['--ancho-borrar' as string]: `${ANCHO}px` }}>
      <button
        className={s.borrar}
        type="button"
        aria-label="Borrar"
        onClick={() => {
          haptic(20)
          onBorrar()
        }}
      >
        <Trash size={22} weight="Filled" />
      </button>

      <motion.div
        className={s.desliza}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -ANCHO, right: 0 }}
        dragElastic={{ left: 0.05, right: 0 }}
        onDragEnd={alSoltar}
      >
        {children}
      </motion.div>
    </div>
  )
}
