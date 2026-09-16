import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Danger, Document, TickCircle } from 'reicon-react'
import { Screen } from '@/components/ui/Screen'
import { InsetGroup } from '@/components/ui/InsetGroup'
import { Row } from '@/components/ui/Row'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/StoreContext'
import { categoria } from '@/domain/categorias'
import { euro, fechaRelativa } from '@/domain/format'
import { CATEGORIA_IMPORTADO } from '@/domain/types'
import {
  adivinarMapeo,
  construirMovimientos,
  leerCsv,
  type CsvCargado,
  type MapeoColumnas,
} from '@/domain/csv'
import s from './ImportarScreen.module.css'

/** Cuantas filas se enseñan antes de confirmar. Un extracto trae cientos. */
const MAX_VISTA_PREVIA = 8

/** Un <select> nativo: en iOS abre la rueda del sistema, que es lo que se espera aqui. */
function FilaColumna({
  etiqueta,
  valor,
  opciones,
  onChange,
}: {
  etiqueta: string
  valor: string
  opciones: string[]
  onChange: (valor: string) => void
}) {
  return (
    <Row etiqueta={etiqueta}>
      <select
        className={s.selector}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-label={etiqueta}
      >
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Row>
  )
}

export function ImportarScreen() {
  const { estado, agregarVarios } = useStore()
  const navigate = useNavigate()
  const entradaArchivo = useRef<HTMLInputElement>(null)

  const [carga, setCarga] = useState<CsvCargado | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [mapeo, setMapeo] = useState<MapeoColumnas | null>(null)
  const [error, setError] = useState('')
  const [importados, setImportados] = useState(0)

  const categorias = estado.ajustes.categorias

  const limpiar = () => {
    setCarga(null)
    setMapeo(null)
    setNombreArchivo('')
    setError('')
  }

  const alElegirArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    // Se vacia el input para que elegir el mismo archivo otra vez vuelva a disparar
    // el evento; si no, corregir el CSV y reintentar no hace nada.
    e.target.value = ''
    if (!archivo) return

    setImportados(0)
    try {
      const leido = leerCsv(await archivo.text())
      if (leido.columnas.length < 2 || leido.filas.length === 0) {
        limpiar()
        setError('Ese archivo no parece un CSV.')
        return
      }

      const adivinado = adivinarMapeo(leido.columnas)
      const ultima = leido.columnas[leido.columnas.length - 1]
      setCarga(leido)
      setNombreArchivo(archivo.name)
      setMapeo({
        fecha: adivinado.fecha ?? leido.columnas[0],
        descripcion: adivinado.descripcion ?? leido.columnas[0],
        importe: adivinado.importe ?? ultima,
        categoriaPorDefecto: CATEGORIA_IMPORTADO,
      })
      setError('')
    } catch {
      limpiar()
      setError('No se ha podido leer el archivo.')
    }
  }

  /*
   * construirMovimientos genera ids nuevos en cada llamada, asi que se memoiza:
   * sin esto cada render de la vista previa inventaria ids distintos.
   */
  const filas = useMemo(
    () => (carga && mapeo ? construirMovimientos(carga, mapeo) : []),
    [carga, mapeo]
  )

  const validos = useMemo(
    () => filas.filter((f) => f.valido).map((f) => f.movimiento),
    [filas]
  )
  const descartadas = filas.length - validos.length

  const importar = () => {
    if (validos.length === 0) return
    agregarVarios(validos)
    setImportados(validos.length)
    limpiar()
  }

  if (importados > 0) {
    return (
      <Screen titulo="Importar" clave="importar">
        <div className={s.vacio}>
          <TickCircle size={56} weight="Filled" className={s.iconoBien} />
          <h2 className={s.vacioTitulo}>
            {importados === 1 ? '1 movimiento importado' : `${importados} movimientos importados`}
          </h2>
          <div className={s.acciones}>
            <Button onClick={() => navigate('/gastos')}>Ver mis gastos</Button>
            <Button variante="gris" onClick={() => setImportados(0)}>
              Importar otro
            </Button>
          </div>
        </div>
      </Screen>
    )
  }

  if (!carga || !mapeo) {
    return (
      <Screen titulo="Importar" clave="importar">
        <input
          ref={entradaArchivo}
          className={s.entradaArchivo}
          type="file"
          accept=".csv,text/csv"
          onChange={alElegirArchivo}
        />

        <div className={s.vacio}>
          <Document size={56} className={s.vacioIcono} />
          <h2 className={s.vacioTitulo}>Importa tu extracto</h2>
          <div className={s.acciones}>
            <Button onClick={() => entradaArchivo.current?.click()}>Elegir archivo</Button>
          </div>
        </div>

        {error ? (
          <InsetGroup>
            <Row
              icono={Danger}
              colorIcono="--rojo"
              etiqueta={<span className={s.textoError}>{error}</span>}
            />
          </InsetGroup>
        ) : null}
      </Screen>
    )
  }

  const vistaPrevia = validos.slice(0, MAX_VISTA_PREVIA)

  return (
    <Screen titulo="Importar" clave="importar">
      <input
        ref={entradaArchivo}
        className={s.entradaArchivo}
        type="file"
        accept=".csv,text/csv"
        onChange={alElegirArchivo}
      />

      <InsetGroup>
        <Row
          icono={Document}
          colorIcono="--azul"
          etiqueta={nombreArchivo}
          detalle={`${filas.length} ${filas.length === 1 ? 'fila' : 'filas'}`}
          onClick={() => entradaArchivo.current?.click()}
          chevron
        />
      </InsetGroup>

      <InsetGroup>
        <FilaColumna
          etiqueta="Fecha"
          valor={mapeo.fecha}
          opciones={carga.columnas}
          onChange={(v) => setMapeo({ ...mapeo, fecha: v })}
        />
        <FilaColumna
          etiqueta="Descripción"
          valor={mapeo.descripcion}
          opciones={carga.columnas}
          onChange={(v) => setMapeo({ ...mapeo, descripcion: v })}
        />
        <FilaColumna
          etiqueta="Importe"
          valor={mapeo.importe}
          opciones={carga.columnas}
          onChange={(v) => setMapeo({ ...mapeo, importe: v })}
        />
        <FilaColumna
          etiqueta="Categoría"
          valor={mapeo.categoriaPorDefecto}
          opciones={categorias}
          onChange={(v) => setMapeo({ ...mapeo, categoriaPorDefecto: v })}
        />
      </InsetGroup>

      {validos.length === 0 ? (
        <InsetGroup>
          <Row
            icono={Danger}
            colorIcono="--naranja"
            etiqueta={<span className={s.textoAviso}>Ninguna fila se puede importar</span>}
          />
        </InsetGroup>
      ) : (
        <InsetGroup
          titulo="Vista previa"
          /* Cuantas filas se pierden no es explicacion, es dato: sin esto el
             usuario no se entera de que se deja movimientos por el camino. */
          pie={
            descartadas > 0
              ? `${descartadas} ${descartadas === 1 ? 'fila descartada' : 'filas descartadas'}`
              : undefined
          }
        >
          {vistaPrevia.map((m) => {
            const meta = categoria(m.categoria)
            return (
              <Row
                key={m.id}
                icono={meta.icono}
                colorIcono={meta.varColor}
                etiqueta={m.descripcion}
                detalle={fechaRelativa(m.fecha)}
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
            )
          })}
          {validos.length > vistaPrevia.length ? (
            <Row
              etiqueta={
                <span className={s.textoResto}>y {validos.length - vistaPrevia.length} más</span>
              }
            />
          ) : null}
        </InsetGroup>
      )}

      <div className={s.confirmar}>
        <Button onClick={importar} disabled={validos.length === 0}>
          {validos.length === 1 ? 'Importar 1 movimiento' : `Importar ${validos.length} movimientos`}
        </Button>
        <Button variante="gris" onClick={limpiar}>
          Cancelar
        </Button>
      </div>
    </Screen>
  )
}
