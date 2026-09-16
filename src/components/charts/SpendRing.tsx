import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { muelleAnillo } from '@/lib/motion'
import s from './SpendRing.module.css'

const TAMANO = 220
const GROSOR = 18
const RADIO = (TAMANO - GROSOR) / 2

interface Props {
  /** Porcentaje gastado. Puede pasar de 100. */
  porcentaje: number
  /** Color del trazo, como var(--x). */
  color?: string
  pie?: string
  /** Se pinta en naranja y sin cifra: el numero no significa nada todavia. */
  aviso?: string
}

/**
 * El anillo de gasto.
 *
 * Por encima del 100% se dibuja una segunda vuelta translucida por encima de la
 * primera, que es como resuelven el desbordamiento los anillos de Actividad.
 * Apple Card no tiene respuesta para este caso porque su anillo no puede pasarse.
 */
export function SpendRing({ porcentaje, color = 'var(--azul)', pie, aviso }: Props) {
  const reducido = useReducedMotion()

  const primera = Math.min(100, Math.max(0, porcentaje)) / 100
  const segunda = porcentaje > 100 ? Math.min(1, (porcentaje - 100) / 100) : 0

  // pathLength normalizado 0-1: Motion lo entiende de forma nativa y evita tener
  // que calcular la circunferencia y animar strokeDasharray a mano.
  const largo = useMotionValue(reducido ? primera : 0)
  const largoExceso = useMotionValue(reducido ? segunda : 0)

  // La cifra se anima en un MotionValue y se escribe directo en el nodo: asi cuenta
  // sin re-renderizar el componente en cada frame.
  const cifra = useMotionValue(reducido ? porcentaje : 0)
  const cifraRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reducido) {
      largo.set(primera)
      largoExceso.set(segunda)
      cifra.set(porcentaje)
      return
    }
    const a = animate(largo, primera, muelleAnillo)
    const b = animate(largoExceso, segunda, muelleAnillo)
    const c = animate(cifra, porcentaje, muelleAnillo)
    return () => {
      a.stop()
      b.stop()
      c.stop()
    }
  }, [primera, segunda, porcentaje, reducido, largo, largoExceso, cifra])

  useEffect(() => {
    return cifra.on('change', (v) => {
      if (cifraRef.current) cifraRef.current.textContent = `${Math.round(v)} %`
    })
  }, [cifra])

  return (
    <div className={s.anillo}>
      <svg
        className={s.svg}
        width={TAMANO}
        height={TAMANO}
        viewBox={`0 0 ${TAMANO} ${TAMANO}`}
        aria-hidden
      >
        <circle
          className={s.pista}
          cx={TAMANO / 2}
          cy={TAMANO / 2}
          r={RADIO}
          strokeWidth={GROSOR}
        />
        <motion.circle
          className={s.progreso}
          cx={TAMANO / 2}
          cy={TAMANO / 2}
          r={RADIO}
          strokeWidth={GROSOR}
          stroke={color}
          style={{ pathLength: largo }}
        />
        {porcentaje > 100 ? (
          <motion.circle
            className={s.exceso}
            cx={TAMANO / 2}
            cy={TAMANO / 2}
            r={RADIO}
            strokeWidth={GROSOR}
            stroke={color}
            style={{ pathLength: largoExceso }}
          />
        ) : null}
      </svg>

      <div className={s.centro}>
        {aviso ? (
          <span className={`${s.pie} ${s.aviso}`}>{aviso}</span>
        ) : (
          <>
            <span className={s.cifra} ref={cifraRef} data-numero>
              0 %
            </span>
            {pie ? <span className={s.pie}>{pie}</span> : null}
          </>
        )}
      </div>
    </div>
  )
}
