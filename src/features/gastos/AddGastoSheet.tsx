import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { InsetGroup } from '@/components/ui/InsetGroup'
import { Row } from '@/components/ui/Row'
import { AmountInput } from '@/components/ui/AmountInput'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useStore } from '@/store/StoreContext'
import { categoria } from '@/domain/categorias'
import { nuevoId } from '@/domain/id'
import { fechaHoyISO } from '@/domain/format'
import { CATEGORIA_INGRESO, type TipoMovimiento } from '@/domain/types'
import s from './AddGastoSheet.module.css'

const TIPOS = [
  { valor: 'gasto' as const, texto: 'Gasto' },
  { valor: 'ingreso' as const, texto: 'Ingreso' },
]

export function AddGastoSheet({ onClose }: { onClose: () => void }) {
  const { estado, agregarMovimiento } = useStore()

  const [tipo, setTipo] = useState<TipoMovimiento>('gasto')
  const [monto, setMonto] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  const [cat, setCat] = useState(estado.ajustes.categorias[0] ?? 'Otros')
  const [fecha, setFecha] = useState(fechaHoyISO())

  const valido = monto > 0

  const guardar = () => {
    if (!valido) return
    agregarMovimiento({
      id: nuevoId(),
      fecha,
      tipo,
      categoria: tipo === 'ingreso' ? CATEGORIA_INGRESO : cat,
      descripcion: descripcion.trim() || (tipo === 'ingreso' ? 'Ingreso' : 'Gasto'),
      monto,
    })
    onClose()
  }

  return (
    <Sheet
      titulo={tipo === 'gasto' ? 'Nuevo gasto' : 'Nuevo ingreso'}
      onClose={onClose}
      accion={{ texto: 'Añadir', onClick: guardar, disabled: !valido }}
    >
      <div className={s.contenido}>
        <div className={s.selector}>
          <SegmentedControl
            opciones={TIPOS}
            valor={tipo}
            onChange={setTipo}
            etiqueta="Tipo de movimiento"
          />
        </div>

        {/*
          Sin autoFocus: enfocar un campo mientras el sheet aun se esta
          transformando hace que iOS haga scroll del ancestro transformado y
          destroza la animacion de apertura.
        */}
        <AmountInput valor={monto} onChange={setMonto} aria-label="Importe" />

        <InsetGroup>
          <Row etiqueta="Descripción">
            <input
              className={s.entrada}
              type="text"
              placeholder="Opcional"
              enterKeyHint="done"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </Row>
          <Row etiqueta="Fecha">
            <input
              className={s.entrada}
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </Row>
        </InsetGroup>

        {tipo === 'gasto' ? (
          <InsetGroup titulo="Categoría">
            {estado.ajustes.categorias.map((nombre) => {
              const meta = categoria(nombre)
              return (
                <Row
                  key={nombre}
                  icono={meta.icono}
                  colorIcono={meta.varColor}
                  etiqueta={nombre}
                  valor={nombre === cat ? '✓' : undefined}
                  onClick={() => setCat(nombre)}
                />
              )
            })}
          </InsetGroup>
        ) : null}
      </div>
    </Sheet>
  )
}
