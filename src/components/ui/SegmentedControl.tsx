import { motion } from 'motion/react'
import { useId } from 'react'
import { muellePastilla } from '@/lib/motion'
import { haptic } from '@/lib/hooks/useHaptic'
import s from './SegmentedControl.module.css'

export interface Opcion<T extends string> {
  valor: T
  texto: string
}

interface Props<T extends string> {
  opciones: Opcion<T>[]
  valor: T
  onChange: (valor: T) => void
  /** Para lectores de pantalla: el control no lleva etiqueta visible. */
  etiqueta: string
}

/** El control segmentado de iOS. */
export function SegmentedControl<T extends string>({
  opciones,
  valor,
  onChange,
  etiqueta,
}: Props<T>) {
  const id = useId()

  return (
    <div className={s.control} role="tablist" aria-label={etiqueta}>
      {opciones.map((o) => {
        const activo = o.valor === valor
        return (
          <button
            key={o.valor}
            type="button"
            role="tab"
            aria-selected={activo}
            className={s.segmento}
            data-activo={String(activo)}
            onClick={() => {
              if (activo) return
              haptic()
              onChange(o.valor)
            }}
          >
            {activo ? (
              <motion.span
                layoutId={`pastilla-${id}`}
                className={s.pastilla}
                transition={muellePastilla}
                aria-hidden
              />
            ) : null}
            <span className={s.texto}>{o.texto}</span>
          </button>
        )
      })}
    </div>
  )
}
