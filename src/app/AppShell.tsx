import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useTransform } from 'motion/react'
import { useSheetHost } from './SheetHost'
import s from './AppShell.module.css'

/**
 * El shell fijo, y la vista que presenta a los sheets.
 *
 * Cuando hay un sheet abierto esto se escala al 92% y se redondea, y vuelve a su
 * sitio conforme se arrastra el sheet hacia abajo: la transformacion sale del `y`
 * compartido, asi que va en tiempo real con el dedo en vez de ser una animacion
 * suelta.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { y, altura, haySheet } = useSheetHost()
  const shellRef = useRef<HTMLDivElement>(null)

  // 0 = sheet abierto del todo, 1 = fuera de pantalla
  const progreso = useTransform([y, altura], ([despl, alto]: number[]) => {
    if (!alto) return 1
    return Math.min(1, Math.max(0, despl / alto))
  })

  const escala = useTransform(progreso, [0, 1], [0.92, 1])
  const radio = useTransform(progreso, [0, 1], [24, 0])

  useEffect(() => {
    const el = shellRef.current
    if (!el) return

    // `inert` en vez de una trampa de foco hecha a mano: el navegador ya sabe
    // sacar del orden de tabulacion y ocultar al lector de pantalla todo el arbol.
    el.inert = haySheet

    // will-change solo mientras hay sheet. Si se deja puesto se paga la memoria
    // de la capa para siempre.
    el.style.willChange = haySheet ? 'transform' : ''
  }, [haySheet])

  return (
    <div className={s.raiz}>
      <motion.div
        ref={shellRef}
        className={s.shell}
        style={{ scale: escala, borderRadius: radio }}
      >
        <div className={s.pantallas}>{children}</div>
      </motion.div>
    </div>
  )
}
