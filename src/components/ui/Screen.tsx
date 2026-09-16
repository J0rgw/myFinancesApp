import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useScroll, type MotionValue } from 'motion/react'
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration'
import { NavBar } from './NavBar'
import { DemoNotice } from '@/features/demo/DemoNotice'
import { useStore } from '@/store/StoreContext'
import s from './Screen.module.css'

/*
 * La posicion de scroll se publica por contexto en vez de pasarla por props:
 * NavBar esta fuera del scroller (fijo arriba) pero necesita reaccionar a el.
 *
 * Es un MotionValue, no estado. Un setState por frame de scroll re-renderiza el
 * arbol entero y se carga el rendimiento en el movil.
 */
const ScrollCtx = createContext<MotionValue<number> | null>(null)

export function useScrollPantalla(): MotionValue<number> {
  const v = useContext(ScrollCtx)
  if (!v) throw new Error('useScrollPantalla tiene que usarse dentro de <Screen>')
  return v
}

interface Props {
  titulo: string
  /** Identifica la pantalla para recordar su posicion de scroll al volver. */
  clave: string
  /** Boton a la derecha de la barra. */
  accion?: ReactNode
  children: ReactNode
}

export function Screen({ titulo, clave, accion, children }: Props) {
  const { esDemo } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({ container: ref })

  useScrollRestoration(`${esDemo ? 'demo' : 'personal'}-${clave}`, ref)

  return (
    <ScrollCtx.Provider value={scrollY}>
      <div className={s.screen}>
        <NavBar titulo={esDemo ? `${titulo} · Demo` : titulo} accion={accion} />
        <div ref={ref} className={s.scroller}>
          <h1 className={s.tituloGrande}>{titulo}</h1>
          <DemoNotice ofrecerDemo={clave === 'panel' || clave === 'meta'} />
          <div className={s.contenido}>{children}</div>
        </div>
      </div>
    </ScrollCtx.Provider>
  )
}
