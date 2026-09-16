import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChartPie } from 'reicon-react'
import { Screen } from '@/components/ui/Screen'
import { InsetGroup } from '@/components/ui/InsetGroup'
import { Row } from '@/components/ui/Row'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SpendRing } from '@/components/charts/SpendRing'
import { CategoryBars } from '@/components/charts/CategoryBars'
import { useStore } from '@/store/StoreContext'
import { categoria } from '@/domain/categorias'
import { euro, nombreMes, porcentaje } from '@/domain/format'
import s from './PanelScreen.module.css'

type Base = 'ingreso' | 'presupuesto'

const OPCIONES = [
  { valor: 'ingreso' as const, texto: 'Del ingreso' },
  { valor: 'presupuesto' as const, texto: 'Del presupuesto' },
]

export function PanelScreen() {
  const { derivado } = useStore()
  const { resumen, categorias, proyeccion: proy, mes } = derivado
  const navigate = useNavigate()

  /*
   * Los dos denominadores son un problema de diseño, no solo de calculo.
   *
   * Dos anillos concentricos se leen fatal, asi que hay uno solo y este control
   * cambia contra que se mide. El anillo interpola entre los dos valores con un
   * muelle, que ademas le da un trabajo real al control segmentado.
   */
  const [base, setBase] = useState<Base>('ingreso')

  if (resumen.sinIngreso) {
    return (
      <Screen titulo="Panel" clave="panel">
        <div className={s.vacio}>
          <ChartPie size={56} className={s.vacioIcono} />
          <h2 className={s.vacioTitulo}>Sin datos todavía</h2>
          <p className={s.vacioTexto}>
            Pon tu ingreso mensual y tu meta de ahorro para ver cuánto puedes gastar
            este mes.
          </p>
          <div className={s.acciones}>
            <Button onClick={() => navigate('/meta')}>Configurar mi meta</Button>
          </div>
        </div>
      </Screen>
    )
  }

  const pct =
    base === 'ingreso'
      ? resumen.porcentajeIngresoGastado
      : resumen.porcentajePresupuestoGastado

  // Con la meta fuera de alcance el presupuesto real es negativo y se queda clavado
  // en cero, asi que "0 %" seria mentira. Se cuenta el estado en vez de pintar la cifra.
  const avisoMeta =
    base === 'presupuesto' && resumen.metaInalcanzable
      ? 'Tu meta pide ahorrar más de lo que ingresas'
      : undefined

  const pasado = pct > 100

  return (
    <Screen titulo="Panel" clave="panel">
      <div className={s.hero}>
        <p className={s.mes}>{nombreMes(mes)}</p>

        <SpendRing
          porcentaje={pct}
          color={pasado ? 'var(--rojo)' : 'var(--azul)'}
          pie={
            base === 'ingreso'
              ? `${euro(resumen.gastos)} de ${euro(resumen.ingresoReferencia)}`
              : `${euro(resumen.gastos)} de ${euro(resumen.presupuestoGasto)}`
          }
          aviso={avisoMeta}
        />

        <div className={s.selector}>
          <SegmentedControl
            opciones={OPCIONES}
            valor={base}
            onChange={setBase}
            etiqueta="Medir el gasto contra"
          />
        </div>
      </div>

      <InsetGroup
        titulo="Resumen del mes"
        pie={
          resumen.metaInalcanzable
            ? 'El ahorro que exige tu meta supera tu ingreso, así que no queda presupuesto para gastar. Alarga el plazo o baja la cantidad en la pestaña Meta.'
            : undefined
        }
      >
        <Row etiqueta="Ingreso" valor={euro(resumen.ingresoReferencia)} />
        <Row etiqueta="Gastado" valor={euro(resumen.gastos)} />
        <Row
          etiqueta="Ahorro objetivo"
          detalle={
            resumen.ahorroCustomMensual > 0
              ? 'Meta general y otras metas'
              : 'Lo que tienes que apartar este mes'
          }
          valor={euro(resumen.ahorroMensualTotal)}
        />
        <Row
          etiqueta="Presupuesto"
          detalle={
            resumen.metaInalcanzable
              ? `Haría falta ${euro(Math.abs(resumen.presupuestoBruto))} más al mes`
              : `${porcentaje(resumen.presupuestoPorcentaje)} de tu ingreso`
          }
          valor={euro(resumen.presupuestoGasto)}
        />
        <Row
          etiqueta="Te queda"
          valor={
            <span className={resumen.restantePresupuesto < 0 ? s.destacado : s.positivo}>
              {euro(resumen.restantePresupuesto)}
            </span>
          }
        />
      </InsetGroup>

      <InsetGroup titulo="Gastos por categoría">
        <CategoryBars categorias={categorias} base={base} />
      </InsetGroup>

      {categorias.length > 0 ? (
        <InsetGroup titulo="Detalle">
          {categorias.map((c) => {
            const meta = categoria(c.categoria)
            return (
              <Row
                key={c.categoria}
                icono={meta.icono}
                colorIcono={meta.varColor}
                etiqueta={c.categoria}
                detalle={`${porcentaje(c.porcentajeGasto)} de lo gastado`}
                valor={euro(c.total)}
              />
            )
          })}
        </InsetGroup>
      ) : null}

      <InsetGroup
        titulo="Meta"
        pie={
          proy.mesesEstimados === null
            ? 'Todavía no hay suficiente historial para estimar cuándo llegas.'
            : undefined
        }
      >
        <Row
          etiqueta="Ahorrado"
          detalle={`${porcentaje(proy.porcentajeMeta)} de la meta`}
          valor={euro(proy.ahorroActual)}
        />
        <Row etiqueta="Te falta" valor={euro(proy.faltaParaMeta)} />
        <Row
          etiqueta="A tu ritmo actual"
          valor={
            proy.mesesEstimados === null
              ? '—'
              : proy.mesesEstimados === 0
                ? 'Ya está'
                : `${proy.mesesEstimados} ${proy.mesesEstimados === 1 ? 'mes' : 'meses'}`
          }
        />
        <Row
          etiqueta="Vas a llegar"
          valor={
            <span className={proy.cumpleObjetivo ? s.positivo : s.destacado}>
              {proy.cumpleObjetivo ? 'Sí' : 'No a este ritmo'}
            </span>
          }
        />
      </InsetGroup>
    </Screen>
  )
}
