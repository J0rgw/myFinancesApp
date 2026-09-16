import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import {
  animate,
  motion,
  useDragControls,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'motion/react'
import { useSheetHost } from '@/app/SheetHost'
import { useAlturaTeclado } from '@/lib/hooks/useTeclado'
import { muelleSheet } from '@/lib/motion'
import { Button } from './Button'
import s from './Sheet.module.css'

interface Props {
  titulo: string
  onClose: () => void
  /** Accion principal a la derecha ("Listo", "Añadir"...). */
  accion?: { texto: string; onClick: () => void; disabled?: boolean }
  children: ReactNode
}

/** Se cierra si el gesto es rapido, o si ya ha recorrido bastante y no vuelve hacia arriba. */
function debeCerrar(info: PanInfo, alto: number): boolean {
  if (info.velocity.y > 500) return true
  // El guardia de velocidad es lo que evita que "arrastrar abajo y devolver hacia
  // arriba de un golpe" cierre por error: sin el, el sheet parece que te pelea.
  return info.velocity.y >= -100 && info.offset.y > alto * 0.4
}

export function Sheet({ titulo, onClose, accion, children }: Props) {
  const { y, altura, contenedor, registrar, desregistrar } = useSheetHost()
  const alturaTeclado = useAlturaTeclado()
  const reducido = useReducedMotion()
  const controls = useDragControls()
  const tituloId = useId()

  const sheetRef = useRef<HTMLDivElement>(null)
  const cuerpoRef = useRef<HTMLDivElement>(null)
  const altoRef = useRef(0)

  // Refs, no estado: esto se lee en cada pointermove y en cada scroll. Un setState
  // por frame re-renderizaria el arbol entero.
  const enTop = useRef(true)
  const gestoTomado = useRef(false)
  const inicioY = useRef(0)

  // Derivado de los dos motion values: si se leyera altoRef.current aqui, en el
  // primer render vale 0 y useTransform se quedaria con el rango equivocado para
  // siempre.
  const opacidadFondo = useTransform([y, altura], ([despl, alto]: number[]) => {
    const h = alto || 600
    return 1 - Math.min(1, Math.max(0, despl / h))
  })

  useLayoutEffect(() => {
    const alto = sheetRef.current?.offsetHeight ?? window.innerHeight
    altoRef.current = alto
    registrar(alto)

    if (reducido) {
      y.set(0)
    } else {
      y.set(alto)
      animate(y, 0, muelleSheet)
    }

    return () => desregistrar()
    // Solo al montar: el sheet no cambia de identidad mientras vive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cerrar = useCallback(() => {
    const alto = altoRef.current || window.innerHeight
    if (reducido) {
      onClose()
      return
    }
    // Se anima el motion value y solo despues se desmonta. Si cerraramos via
    // AnimatePresence, el exit descartaria la velocidad del gesto y el traspaso
    // se veria como un tiron.
    animate(y, alto, { type: 'spring', visualDuration: 0.3, bounce: 0 }).then(onClose)
  }, [onClose, reducido, y])

  // Escape cierra, como cualquier dialogo
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [cerrar])

  const alScroll = () => {
    enTop.current = (cuerpoRef.current?.scrollTop ?? 0) <= 0
  }

  /*
   * Arbitraje entre arrastrar el sheet y hacer scroll en su cuerpo, copiado del
   * comportamiento real de UIKit:
   *
   *  - cuerpo arriba del todo Y gesto hacia abajo -> arrastra el sheet
   *  - en cualquier otro caso -> hace scroll el cuerpo
   *  - quien gana se queda el gesto hasta que se levanta el dedo
   *
   * Esa ultima regla es la que hace que en iOS no puedas cerrar el sheet de un
   * manotazo mientras vas scrolleando: tienes que soltar y volver a tocar. Se
   * reproduce a proposito, es parte de lo que hace que se sienta bien.
   */
  const alBajarDedo = (e: ReactPointerEvent) => {
    inicioY.current = e.clientY
    gestoTomado.current = false
  }

  const alMoverDedo = (e: ReactPointerEvent) => {
    if (gestoTomado.current) return
    const dy = e.clientY - inicioY.current
    if (enTop.current && dy > 4) {
      gestoTomado.current = true
      // Se bloquea el scroll mientras dura el arrastre para que el cuerpo no se
      // mueva por debajo del gesto.
      if (cuerpoRef.current) cuerpoRef.current.style.overflowY = 'hidden'
      controls.start(e)
    }
  }

  const alSoltarArrastre = (_e: unknown, info: PanInfo) => {
    if (cuerpoRef.current) cuerpoRef.current.style.overflowY = 'auto'
    gestoTomado.current = false

    if (debeCerrar(info, altoRef.current || window.innerHeight)) {
      const alto = altoRef.current || window.innerHeight
      animate(y, alto, {
        type: 'spring',
        // Hereda la velocidad de salida del dedo o el traspaso se ve a saltos
        velocity: info.velocity.y,
        visualDuration: 0.3,
        bounce: 0,
      }).then(onClose)
    } else {
      animate(y, 0, muelleSheet)
    }
  }

  if (!contenedor) return null

  return createPortal(
    <div className={s.capa}>
      <motion.div className={s.fondo} style={{ opacity: opacidadFondo }} onClick={cerrar} />

      <motion.div
        ref={sheetRef}
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        style={{ y, paddingBottom: alturaTeclado }}
        drag="y"
        dragControls={controls}
        // Nada de arrastre automatico: lo decide el arbitraje de arriba
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        // "Los sheets no se estiran hacia arriba y caen libres hacia abajo"
        dragElastic={{ top: 0, bottom: 1 }}
        onDragEnd={alSoltarArrastre}
      >
        <div className={s.agarre} onPointerDown={(e) => controls.start(e)} />

        <div className={s.barra} onPointerDown={(e) => controls.start(e)}>
          <span className={s.izquierda}>
            <Button variante="plano" onClick={cerrar}>
              Cancelar
            </Button>
          </span>
          <span className={s.titulo} id={tituloId}>
            {titulo}
          </span>
          <span className={s.derecha}>
            {accion ? (
              <Button
                variante="plano"
                enfasis
                disabled={accion.disabled}
                onClick={accion.onClick}
              >
                {accion.texto}
              </Button>
            ) : null}
          </span>
        </div>

        <div
          ref={cuerpoRef}
          className={s.cuerpo}
          onScroll={alScroll}
          onPointerDown={alBajarDedo}
          onPointerMove={alMoverDedo}
        >
          {children}
        </div>
      </motion.div>
    </div>,
    contenedor
  )
}
