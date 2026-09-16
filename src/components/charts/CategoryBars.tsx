import { motion, useReducedMotion } from 'motion/react'
import { colorCategoria } from '@/domain/categorias'
import type { GastoPorCategoria } from '@/domain/calculos'
import { euro, porcentaje } from '@/domain/format'
import { muelleBarra } from '@/lib/motion'
import s from './CategoryBars.module.css'

interface Props {
  categorias: GastoPorCategoria[]
  /** Con que denominador se dibuja la barra. */
  base: 'ingreso' | 'presupuesto'
}

export function CategoryBars({ categorias, base }: Props) {
  const reducido = useReducedMotion()

  if (categorias.length === 0) {
    return <p className={s.vacio}>Todavía no hay gastos este mes.</p>
  }

  return (
    <div className={s.lista}>
      {categorias.map((c, i) => {
        const pct =
          base === 'ingreso' ? c.porcentajeIngreso : c.porcentajePresupuesto
        const ancho = Math.min(1, Math.max(0, pct / 100))
        // El color se resuelve en CSS. Pasar un hex desde JS aqui romperia el modo
        // oscuro sin avisar.
        const color = colorCategoria(c.categoria)

        return (
          <div key={c.categoria} className={s.fila}>
            <div className={s.cabecera}>
              <span className={s.nombre}>{c.categoria}</span>
              <span className={s.importe} data-numero>
                {euro(c.total)} · {porcentaje(pct)}
              </span>
            </div>
            <div className={s.pista}>
              <motion.div
                className={s.barra}
                style={{ background: color }}
                initial={reducido ? false : { scaleX: 0 }}
                animate={{ scaleX: ancho }}
                transition={{ ...muelleBarra, delay: reducido ? 0 : i * 0.04 }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
