import { useEffect, useState, type Ref } from 'react'
import s from './AmountInput.module.css'

interface Props {
  valor: number
  onChange: (valor: number) => void
  placeholder?: string
  /** Variante compacta para una fila de formulario. */
  enFila?: boolean
  autoFocus?: boolean
  ref?: Ref<HTMLInputElement>
  'aria-label'?: string
}

/** Acepta "12,50" y "12.50"; devuelve NaN si no hay nada aprovechable. */
function aNumero(texto: string): number {
  const limpio = texto.replace(/\s/g, '').replace(',', '.')
  if (limpio === '' || limpio === '.') return NaN
  const n = Number(limpio)
  return Number.isFinite(n) ? n : NaN
}

/** Con coma, que es lo que espera ver alguien escribiendo en español. */
function aTexto(valor: number): string {
  if (!Number.isFinite(valor) || valor === 0) return ''
  return String(valor).replace('.', ',')
}

/**
 * Campo de importe.
 *
 * Es type="text" con inputMode="decimal" a proposito, NO type="number":
 * en es-ES el separador decimal es la coma, el teclado decimal de iOS muestra
 * una coma, y type="number" la RECHAZA. Con type="number" el campo se niega a
 * aceptar lo que el propio teclado del sistema ofrece.
 */
export function AmountInput({
  valor,
  onChange,
  placeholder = '0',
  enFila,
  autoFocus,
  ref,
  'aria-label': ariaLabel,
}: Props) {
  // Estado propio para no reformatear mientras se escribe: si el usuario teclea
  // "12," y lo normalizamos a "12", nunca podria llegar a los decimales.
  const [texto, setTexto] = useState(() => aTexto(valor))

  useEffect(() => {
    const actual = aNumero(texto)
    // Solo se sincroniza si el cambio viene de fuera
    if (!(actual === valor || (Number.isNaN(actual) && valor === 0))) {
      setTexto(aTexto(valor))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  return (
    <div className={`${s.campo} ${enFila ? s.enFila : ''}`}>
      <input
        ref={ref}
        className={s.entrada}
        type="text"
        inputMode="decimal"
        enterKeyHint="done"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={texto}
        onChange={(e) => {
          const bruto = e.target.value
          // Solo digitos y un unico separador decimal
          if (!/^[\d]*[.,]?[\d]{0,2}$/.test(bruto)) return
          setTexto(bruto)
          const n = aNumero(bruto)
          onChange(Number.isNaN(n) ? 0 : n)
        }}
      />
      <span className={s.simbolo} aria-hidden>
        €
      </span>
    </div>
  )
}
