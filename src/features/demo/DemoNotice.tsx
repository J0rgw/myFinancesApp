import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/StoreContext'
import s from './DemoNotice.module.css'

function Bilingue({ en, es }: { en: string; es: string }) {
  return <span className={s.bilingue}><span lang="en">{en}</span><span lang="es">{es}</span></span>
}

export function DemoNotice({ ofrecerDemo }: { ofrecerDemo: boolean }) {
  const { esDemo, iniciarDemo, salirDemo, errorGuardadoDemo } = useStore()
  const navigate = useNavigate()
  const [confirmarReset, setConfirmarReset] = useState(false)
  if (!esDemo && !ofrecerDemo) return null

  const iniciar = () => {
    iniciarDemo()
    navigate('/panel', { replace: true, state: null })
  }

  return (
    <section className={s.aviso} aria-label="Demo / Demostración">
      <h2 className={s.titulo}>
        <Bilingue en={esDemo ? 'Demo · Synthetic data' : 'Explore MoneyMan'}
          es={esDemo ? 'Demo · Datos ficticios' : 'Explora MoneyMan'} />
      </h2>
      {!esDemo ? <p className={s.descripcion}>
        <Bilingue
          en="Try a sample month of income, spending and savings. Your personal data stays separate."
          es="Prueba un mes ficticio de ingresos, gastos y ahorro. Tus datos personales siguen separados."
        />
      </p> : null}
      <div className={s.acciones}>
        {esDemo ? <>
          <Button variante="gris" onClick={() => setConfirmarReset(true)}>
            <Bilingue en="Reset demo" es="Restablecer demo" /></Button>
          <Button variante="gris" onClick={() => {
            salirDemo()
            navigate('/panel', { replace: true, state: null })
          }}><Bilingue en="Exit demo" es="Salir de la demo" /></Button>
        </> : <Button onClick={iniciar}><Bilingue en="Try demo" es="Probar demo" /></Button>}
      </div>
      {confirmarReset ? <div>
        <p role="alert" className={s.descripcion}><Bilingue
          en="Replace demo changes with the original sample? Personal data is unaffected."
          es="¿Reemplazar los cambios de la demo por el ejemplo original? Tus datos personales no se modificarán." /></p>
        <div className={s.acciones}>
          <Button onClick={iniciar}><Bilingue en="Confirm reset" es="Confirmar reinicio" /></Button>
          <Button variante="gris" onClick={() => setConfirmarReset(false)}>
            <Bilingue en="Cancel" es="Cancelar" /></Button>
        </div>
      </div> : null}
      {esDemo ? <details className={s.detalles}>
        <summary><span lang="en">About this demo</span> / Sobre esta demo</summary>
        <p className={s.nota}><Bilingue
          en="A sample month, including future dates. Use sample files only. Changes stay separate from personal data. Exiting discards the demo; reloading keeps it in this tab."
          es="Un mes ficticio, con fechas futuras. Usa solo archivos de ejemplo. Los cambios quedan separados de tus datos personales. Al salir se descarta la demo; al recargar se mantiene en esta pestaña." /></p>
      </details> : null}
      {errorGuardadoDemo ? <p role="alert" className={s.nota}><Bilingue
        en="Demo storage is unavailable. Changes may be lost on reload."
        es="El almacenamiento de la demo no está disponible. Los cambios pueden perderse al recargar." /></p> : null}
    </section>
  )
}
