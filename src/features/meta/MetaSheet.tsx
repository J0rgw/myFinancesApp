import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { InsetGroup } from '@/components/ui/InsetGroup'
import { Row } from '@/components/ui/Row'
import { AmountInput } from '@/components/ui/AmountInput'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useStore } from '@/store/StoreContext'
import { nuevoId } from '@/domain/id'
import { euro, porcentaje } from '@/domain/format'
import { ahorroObjetivoMensual, mensualMetaCustom } from '@/domain/calculos'
import { HORIZONTES, type Horizonte, type MetaCustom } from '@/domain/types'
import s from './MetaSheet.module.css'

const OPCIONES = HORIZONTES.map((h) => ({
  valor: String(h) as `${Horizonte}`,
  texto: h === 12 ? '1 año' : `${h} ${h === 1 ? 'mes' : 'meses'}`,
}))

/**
 * La meta general: llegar a una cantidad en un plazo. Su "ya ahorrado" es el ahorro
 * actual global (pestaña Tu dinero), por eso aquí solo se edita cantidad y plazo.
 */
export function MetaGeneralSheet({ onClose }: { onClose: () => void }) {
  const { estado, derivado, actualizarAjustes } = useStore()
  const ingreso = derivado.resumen.ingresoReferencia

  const [metaAhorro, setMetaAhorro] = useState(estado.ajustes.metaAhorro)
  const [horizonte, setHorizonte] = useState<Horizonte>(estado.ajustes.horizonteMeses)

  const mensual = ahorroObjetivoMensual({
    ...estado.ajustes,
    metaAhorro,
    horizonteMeses: horizonte,
  })
  const pct = ingreso > 0 ? (mensual / ingreso) * 100 : 0

  const guardar = () => {
    actualizarAjustes({ metaAhorro, horizonteMeses: horizonte })
    onClose()
  }

  return (
    <Sheet
      titulo="Meta de ahorro"
      onClose={onClose}
      accion={{ texto: 'Guardar', onClick: guardar }}
    >
      <div className={s.contenido}>
        <InsetGroup pie="Cuenta con tu ahorro actual como punto de partida.">
          <Row etiqueta="Quiero llegar a">
            <AmountInput
              enFila
              valor={metaAhorro}
              onChange={setMetaAhorro}
              aria-label="Cantidad que quieres alcanzar"
            />
          </Row>
        </InsetGroup>

        <div className={s.selector}>
          <SegmentedControl
            opciones={OPCIONES}
            valor={String(horizonte) as `${Horizonte}`}
            onChange={(v) => setHorizonte(Number(v) as Horizonte)}
            etiqueta="En cuánto tiempo"
          />
        </div>

        <div className={s.previa}>
          {mensual > 0 ? (
            <>
              <span className={s.cifra} data-numero>
                {euro(mensual)}
              </span>
              <p className={s.leyenda}>
                al mes{ingreso > 0 ? ` · ${porcentaje(pct)} de tu ingreso` : ''}
              </p>
            </>
          ) : (
            <p className={s.leyenda}>
              Pon cuánto quieres ahorrar para ver cuánto apartar al mes.
            </p>
          )}
        </div>
      </div>
    </Sheet>
  )
}

/**
 * Crear o editar una meta con nombre. Si llega `meta`, edita (y ofrece borrarla);
 * si no, crea. Enseña en vivo cuánto sale al mes mientras se teclea.
 */
export function MetaSheet({ meta, onClose }: { meta?: MetaCustom; onClose: () => void }) {
  const { derivado, agregarMetaCustom, actualizarMetaCustom, borrarMetaCustom } = useStore()
  const ingreso = derivado.resumen.ingresoReferencia

  const [nombre, setNombre] = useState(meta?.nombre ?? '')
  const [objetivo, setObjetivo] = useState(meta?.objetivo ?? 0)
  const [ahorrado, setAhorrado] = useState(meta?.ahorrado ?? 0)
  // Los meses viven como texto para poder borrar el campo mientras se escribe.
  const [mesesTexto, setMesesTexto] = useState(meta ? String(meta.meses) : '3')
  const meses = Math.floor(Number(mesesTexto) || 0)

  const valido = nombre.trim() !== '' && objetivo > 0 && meses >= 1

  // Se calcula con los valores en curso para la vista previa.
  const mensual = mensualMetaCustom({ id: '', nombre, objetivo, meses, ahorrado })
  const pct = ingreso > 0 ? (mensual / ingreso) * 100 : 0

  const guardar = () => {
    if (!valido) return
    const datos = { nombre: nombre.trim(), objetivo, meses, ahorrado }
    if (meta) actualizarMetaCustom(meta.id, datos)
    else agregarMetaCustom({ id: nuevoId(), ...datos })
    onClose()
  }

  const borrar = () => {
    if (!meta) return
    borrarMetaCustom(meta.id)
    onClose()
  }

  return (
    <Sheet
      titulo={meta ? 'Editar meta' : 'Nueva meta'}
      onClose={onClose}
      accion={{ texto: meta ? 'Guardar' : 'Añadir', onClick: guardar, disabled: !valido }}
    >
      <div className={s.contenido}>
        {/* Sin autoFocus: enfocar mientras el sheet se transforma rompe la animación. */}
        <InsetGroup>
          <Row etiqueta="Nombre">
            <input
              className={s.entrada}
              type="text"
              placeholder="Silla de escritorio"
              enterKeyHint="done"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </Row>
        </InsetGroup>

        <InsetGroup titulo="Cuánto y en cuánto tiempo">
          <Row etiqueta="Precio">
            <AmountInput
              enFila
              valor={objetivo}
              onChange={setObjetivo}
              aria-label="Precio de la meta"
            />
          </Row>
          <Row etiqueta="Ya ahorrado" detalle="Lo que llevas apartado para esto">
            <AmountInput
              enFila
              valor={ahorrado}
              onChange={setAhorrado}
              aria-label="Lo que ya llevas ahorrado"
            />
          </Row>
          <Row etiqueta="Meses">
            <input
              className={s.entrada}
              type="text"
              inputMode="numeric"
              placeholder="3"
              enterKeyHint="done"
              value={mesesTexto}
              onChange={(e) => {
                if (!/^\d{0,3}$/.test(e.target.value)) return
                setMesesTexto(e.target.value)
              }}
              aria-label="Número de meses"
            />
          </Row>
        </InsetGroup>

        <div className={s.previa}>
          {objetivo > 0 && meses >= 1 ? (
            <>
              <span className={s.cifra} data-numero>
                {euro(mensual)}
              </span>
              <p className={s.leyenda}>
                al mes durante {meses} {meses === 1 ? 'mes' : 'meses'}
                {ingreso > 0 ? ` · ${porcentaje(pct)} de tu ingreso` : ''}
              </p>
            </>
          ) : (
            <p className={s.leyenda}>
              Pon un precio y un plazo para ver cuánto tienes que apartar al mes.
            </p>
          )}
        </div>

        {meta ? (
          <InsetGroup>
            <Row
              etiqueta={<span style={{ color: 'var(--rojo)' }}>Borrar meta</span>}
              onClick={borrar}
            />
          </InsetGroup>
        ) : null}
      </div>
    </Sheet>
  )
}
