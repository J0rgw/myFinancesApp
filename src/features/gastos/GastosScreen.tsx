import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Wallet } from 'reicon-react'
import { Screen } from '@/components/ui/Screen'
import { InsetGroup } from '@/components/ui/InsetGroup'
import { Row } from '@/components/ui/Row'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/StoreContext'
import { categoria } from '@/domain/categorias'
import { euro, fechaRelativa } from '@/domain/format'
import type { Movimiento } from '@/domain/types'
import { AddGastoSheet } from './AddGastoSheet'
import { SwipeRow } from './SwipeRow'
import s from './GastosScreen.module.css'

function agruparPorDia(movimientos: Movimiento[]): [string, Movimiento[]][] {
  const mapa = new Map<string, Movimiento[]>()
  for (const m of movimientos) {
    const lista = mapa.get(m.fecha)
    if (lista) lista.push(m)
    else mapa.set(m.fecha, [m])
  }
  // Mas reciente primero
  return Array.from(mapa.entries()).sort((a, b) => b[0].localeCompare(a[0]))
}

export function GastosScreen() {
  const { estado, borrarMovimiento } = useStore()
  const location = useLocation()
  const navigate = useNavigate()

  /*
   * El sheet es una entrada del historial, no un estado local.
   *
   * Asi el boton atras de Android lo cierra en vez de cerrar la PWA entera, que es
   * lo unico que se rompe de verdad sin router.
   */
  const sheetAbierto = (location.state as { sheet?: string } | null)?.sheet === 'nuevo'
  const abrir = () => navigate(location.pathname, { state: { sheet: 'nuevo' } })
  const cerrar = () => navigate(-1)

  const dias = useMemo(() => agruparPorDia(estado.movimientos), [estado.movimientos])

  const accion = (
    <button className={s.anadir} type="button" onClick={abrir} aria-label="Añadir movimiento">
      <Plus size={24} />
    </button>
  )

  return (
    <>
      <Screen titulo="Gastos" clave="gastos" accion={accion}>
        {dias.length === 0 ? (
          <div className={s.vacio}>
            <Wallet size={56} className={s.vacioIcono} />
            <h2 className={s.vacioTitulo}>Sin movimientos</h2>
            <p className={s.vacioTexto}>
              Añade un gasto a mano o importa el CSV de tu banco.
            </p>
            <div className={s.acciones}>
              <Button onClick={abrir}>Añadir gasto</Button>
            </div>
          </div>
        ) : (
          dias.map(([fecha, movs]) => (
            <InsetGroup key={fecha} titulo={fechaRelativa(fecha)}>
              {movs.map((m) => {
                const meta = categoria(m.categoria)
                return (
                  <SwipeRow key={m.id} onBorrar={() => borrarMovimiento(m.id)}>
                    <Row
                      icono={meta.icono}
                      colorIcono={meta.varColor}
                      etiqueta={m.descripcion}
                      detalle={m.categoria}
                      valor={
                        <span
                          className={`${s.importe} ${m.tipo === 'ingreso' ? s.ingreso : ''}`}
                          data-numero
                        >
                          {m.tipo === 'ingreso' ? '+' : '−'}
                          {euro(m.monto)}
                        </span>
                      }
                    />
                  </SwipeRow>
                )
              })}
            </InsetGroup>
          ))
        )}
      </Screen>

      {sheetAbierto ? <AddGastoSheet onClose={cerrar} /> : null}
    </>
  )
}
