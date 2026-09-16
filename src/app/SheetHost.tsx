import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useMotionValue, type MotionValue } from 'motion/react'

interface Contexto {
  /** Desplazamiento vertical del sheet en px. 0 = abierto del todo. */
  y: MotionValue<number>
  /** Alto del sheet montado, o 0 si no hay ninguno. */
  altura: MotionValue<number>
  /** Hay un sheet montado. Lo usa AppShell para poner inert el fondo. */
  haySheet: boolean
  registrar: (alto: number) => void
  desregistrar: () => void
  /** Donde se portalean los sheets: encima del shell, no dentro. */
  contenedor: HTMLDivElement | null
}

const Ctx = createContext<Contexto | null>(null)

export function useSheetHost(): Contexto {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSheetHost tiene que usarse dentro de <SheetHost>')
  return v
}

/**
 * Dueño del `y` compartido de los sheets.
 *
 * Esto vive aqui y no dentro de <Sheet> por un motivo estructural: el sheet tipo
 * tarjeta de iOS escala la vista que lo presenta al 92% de forma interactiva, y esa
 * vista es el padre del hermano del sheet. Un <Sheet> autocontenido no puede
 * alcanzarla. AppShell lee este `y` y se escala solo.
 */
export function SheetHost({ children }: { children: ReactNode }) {
  const y = useMotionValue(0)
  const altura = useMotionValue(0)
  const [haySheet, setHaySheet] = useState(false)
  const [contenedor, setContenedor] = useState<HTMLDivElement | null>(null)
  const montados = useRef(0)

  const valor = useMemo<Contexto>(
    () => ({
      y,
      altura,
      haySheet,
      contenedor,
      registrar: (alto: number) => {
        montados.current += 1
        altura.set(alto)
        setHaySheet(true)
      },
      desregistrar: () => {
        montados.current = Math.max(0, montados.current - 1)
        if (montados.current === 0) {
          altura.set(0)
          y.set(0)
          setHaySheet(false)
        }
      },
    }),
    [y, altura, haySheet, contenedor]
  )

  return (
    <Ctx.Provider value={valor}>
      {children}
      <div ref={setContenedor} />
    </Ctx.Provider>
  )
}
