import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'reicon-react'
import { Screen } from '@/components/ui/Screen'
import { InsetGroup } from '@/components/ui/InsetGroup'
import { Row } from '@/components/ui/Row'
import { Button } from '@/components/ui/Button'
import { AmountInput } from '@/components/ui/AmountInput'
import { useStore } from '@/store/StoreContext'
import { euro, porcentaje } from '@/domain/format'
import type { Horizonte } from '@/domain/types'
import { MetaGeneralSheet, MetaSheet } from './MetaSheet'
import s from './MetaScreen.module.css'

const horizonteTexto = (h: Horizonte) =>
  h === 12 ? '1 año' : `${h} ${h === 1 ? 'mes' : 'meses'}`

export function MetaScreen() {
  const { estado, actualizarAjustes, reiniciar, derivado } = useStore()
  const { ajustes } = estado
  const { resumen, metasCustom } = derivado

  /*
   * Los sheets son entradas del historial, no estado local: así el botón atrás los
   * cierra en vez de cerrar la PWA. Mismo patrón que la lista de gastos.
   */
  const location = useLocation()
  const navigate = useNavigate()
  const estadoSheet = location.state as { sheet?: string; metaId?: string } | null
  const abierto = estadoSheet?.sheet
  const metaEditando = estadoSheet?.metaId
    ? ajustes.metasCustom.find((m) => m.id === estadoSheet.metaId)
    : undefined
  const abrirGeneral = () => navigate(location.pathname, { state: { sheet: 'general' } })
  const abrirNueva = () => navigate(location.pathname, { state: { sheet: 'meta' } })
  const editar = (id: string) =>
    navigate(location.pathname, { state: { sheet: 'meta', metaId: id } })
  const cerrar = () => navigate(-1)

  // La meta general, presentada como una fila más de la lista.
  const generalDefinida = ajustes.metaAhorro > 0
  const generalMensual = resumen.ahorroObjetivoMensual
  const generalPct =
    resumen.ingresoReferencia > 0
      ? (generalMensual / resumen.ingresoReferencia) * 100
      : 0
  const generalCompletada = generalDefinida && generalMensual <= 0

  const porcentajeAhorro =
    resumen.ingresoReferencia > 0
      ? (resumen.ahorroMensualTotal / resumen.ingresoReferencia) * 100
      : 0

  return (
    <>
      <Screen titulo="Meta" clave="meta">
        <InsetGroup
          titulo="Tu dinero"
          pie="El ingreso mensual se usa como referencia mientras no haya ingresos reales registrados este mes."
        >
          <Row etiqueta="Ingreso">
            <AmountInput
              enFila
              valor={ajustes.ingresoMensual}
              onChange={(v) => actualizarAjustes({ ingresoMensual: v })}
              aria-label="Ingreso mensual"
            />
          </Row>
          <Row etiqueta="Ahorro actual">
            <AmountInput
              enFila
              valor={ajustes.ahorroInicial}
              onChange={(v) => actualizarAjustes({ ahorroInicial: v })}
              aria-label="Ahorro actual"
            />
          </Row>
        </InsetGroup>

        <InsetGroup
          titulo="Metas"
          pie="Todas compiten por tu ingreso: cada una se descuenta de tu presupuesto."
        >
          <Row
            etiqueta="Meta de ahorro"
            detalle={
              !generalDefinida
                ? 'Toca para definirla'
                : generalCompletada
                  ? 'Completada'
                  : resumen.ingresoReferencia > 0
                    ? `${horizonteTexto(ajustes.horizonteMeses)} · ${porcentaje(generalPct)} de tu ingreso`
                    : horizonteTexto(ajustes.horizonteMeses)
            }
            valor={
              !generalDefinida ? undefined : generalCompletada ? (
                <span className={s.completada}>Ya está</span>
              ) : (
                <span data-numero>
                  {euro(generalMensual)}
                  <span className={s.porMes}>/mes</span>
                </span>
              )
            }
            chevron={!generalDefinida}
            onClick={abrirGeneral}
          />

          {metasCustom.map((c) => (
            <Row
              key={c.meta.id}
              etiqueta={c.meta.nombre}
              detalle={
                c.completada
                  ? 'Completada'
                  : resumen.ingresoReferencia > 0
                    ? `${c.meta.meses} ${c.meta.meses === 1 ? 'mes' : 'meses'} · ${porcentaje(c.porcentajeIngreso)} de tu ingreso`
                    : `${c.meta.meses} ${c.meta.meses === 1 ? 'mes' : 'meses'}`
              }
              valor={
                c.completada ? (
                  <span className={s.completada}>Ya está</span>
                ) : (
                  <span data-numero>
                    {euro(c.mensual)}
                    <span className={s.porMes}>/mes</span>
                  </span>
                )
              }
              onClick={() => editar(c.meta.id)}
            />
          ))}

          <Row icono={Plus} colorIcono="--verde" etiqueta="Añadir meta" onClick={abrirNueva} />
        </InsetGroup>

        {/* El presupuesto es derivado, nunca se escribe. Se recalcula al teclear. */}
        <div className={s.resultado}>
          <span
            className={`${s.cifra} ${resumen.metaInalcanzable ? s.cifraMal : ''}`}
            data-numero
          >
            {euro(resumen.ahorroMensualTotal)}
          </span>
          <p className={s.leyenda}>al mes para tus metas</p>

          {resumen.sinIngreso ? (
            <p className={s.leyenda}>Pon tu ingreso mensual para ver si te cabe.</p>
          ) : resumen.metaInalcanzable ? (
            <p className={`${s.leyenda} ${s.aviso}`}>
              No entra en tu salario: es {euro(Math.abs(resumen.presupuestoBruto))} más de
              lo que ingresas. Alarga algún plazo o baja alguna cantidad.
            </p>
          ) : resumen.ahorroMensualTotal <= 0 ? (
            <p className={s.leyenda}>Pon una meta para calcular cuánto ahorrar al mes.</p>
          ) : (
            <p className={s.leyenda}>
              Ahorras el {porcentaje(porcentajeAhorro)} de tu ingreso. Te quedan{' '}
              {euro(resumen.presupuestoGasto)} para gastar.
            </p>
          )}
        </div>

        <InsetGroup
          titulo="Datos"
          pie="Todo se guarda solo en este dispositivo. Borrarlo no se puede deshacer."
        >
          <Row
            etiqueta={<span style={{ color: 'var(--rojo)' }}>Borrar todos mis datos</span>}
            onClick={() => {
              if (confirm('¿Seguro que quieres borrar todos tus datos?')) reiniciar()
            }}
          />
        </InsetGroup>

        <div style={{ padding: '0 var(--margen)' }}>
          <Button variante="gris" onClick={() => history.back()}>
            Volver
          </Button>
        </div>
      </Screen>

      {abierto === 'general' ? <MetaGeneralSheet onClose={cerrar} /> : null}
      {abierto === 'meta' ? <MetaSheet meta={metaEditando} onClose={cerrar} /> : null}
    </>
  )
}
