import { useState, type ReactNode } from 'react'
import { ChevronRight, type IconComponent } from 'reicon-react'
import s from './Row.module.css'

interface Props {
  etiqueta: ReactNode
  detalle?: ReactNode
  valor?: ReactNode
  icono?: IconComponent
  /** Nombre de variable CSS, p.ej. "--cat-comida". Nunca un hex. */
  colorIcono?: string
  chevron?: boolean
  onClick?: () => void
  children?: ReactNode
}

export function Row({
  etiqueta,
  detalle,
  valor,
  icono: Icono,
  colorIcono,
  chevron,
  onClick,
  children,
}: Props) {
  const [pulsada, setPulsada] = useState(false)
  const pulsable = Boolean(onClick)

  // Solo se usa como boton si de verdad hace algo; si no, es una fila de datos.
  const Elemento = pulsable ? 'button' : 'div'

  return (
    <Elemento
      className={`${s.fila} ${pulsable ? s.pulsable : ''}`}
      data-con-icono={Icono ? '' : undefined}
      data-pulsada={pulsable ? String(pulsada) : undefined}
      onClick={onClick}
      // pointer* cubre raton y tacto con un solo juego de eventos
      onPointerDown={pulsable ? () => setPulsada(true) : undefined}
      onPointerUp={pulsable ? () => setPulsada(false) : undefined}
      onPointerLeave={pulsable ? () => setPulsada(false) : undefined}
      onPointerCancel={pulsable ? () => setPulsada(false) : undefined}
      type={pulsable ? 'button' : undefined}
    >
      {Icono ? (
        <span
          className={s.icono}
          style={{ background: colorIcono ? `var(${colorIcono})` : 'var(--gris)' }}
        >
          <Icono size={17} weight="Filled" color="#fff" />
        </span>
      ) : null}

      <span className={s.centro}>
        <span className={s.etiqueta}>{etiqueta}</span>
        {detalle ? <span className={s.detalle}>{detalle}</span> : null}
      </span>

      {children}
      {valor ? <span className={s.valor}>{valor}</span> : null}
      {chevron ? <ChevronRight size={18} className={s.chevron} /> : null}
    </Elemento>
  )
}
