import { useLayoutEffect, type RefObject } from 'react'

/*
 * iOS recuerda la posicion de scroll de cada pestaña. Nosotros tambien tenemos que
 * hacerlo a mano:
 *
 *  - <ScrollRestoration> de react-router solo controla el scroller de la ventana, y
 *    aqui quien hace scroll es un div interno (ver global.css).
 *  - Mantener las cuatro pantallas montadas y ocultarlas con display:none tampoco
 *    vale: display:none pierde el scrollTop.
 */
const posiciones = new Map<string, number>()

export function useScrollRestoration(
  clave: string,
  ref: RefObject<HTMLElement | null>
): void {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const guardada = posiciones.get(clave)
    if (guardada != null) el.scrollTop = guardada

    return () => {
      posiciones.set(clave, el.scrollTop)
    }
  }, [clave, ref])
}
