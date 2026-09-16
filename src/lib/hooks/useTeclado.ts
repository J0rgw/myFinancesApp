import { useEffect, useState } from 'react'

/**
 * Cuantos px tapa el teclado por abajo.
 *
 * En modo standalone iOS NO redimensiona el viewport al abrir el teclado: desplaza
 * la pagina. Con el shell fijo (ver global.css) eso significa que el teclado tapa
 * los campos y no hay CSS capaz de arreglarlo. La unica fuente de verdad es
 * visualViewport.
 *
 * Se nota el primer dia, en cuanto se abre el sheet de "Añadir gasto".
 */
export function useAlturaTeclado(): number {
  const [alto, setAlto] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const medir = () => {
      const tapado = window.innerHeight - vv.height - vv.offsetTop
      setAlto(Math.max(0, Math.round(tapado)))
    }

    medir()
    vv.addEventListener('resize', medir)
    vv.addEventListener('scroll', medir)
    return () => {
      vv.removeEventListener('resize', medir)
      vv.removeEventListener('scroll', medir)
    }
  }, [])

  return alto
}
