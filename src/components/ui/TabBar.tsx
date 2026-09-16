import { NavLink } from 'react-router-dom'
import type { IconComponent } from 'reicon-react'
import { haptic } from '@/lib/hooks/useHaptic'
import s from './TabBar.module.css'

export interface Tab {
  ruta: string
  texto: string
  icono: IconComponent
}

/**
 * La tab bar traslucida.
 *
 * El icono pasa a Filled cuando la pestaña esta activa: iOS marca la seleccion con
 * el peso del icono ademas de con el color.
 */
export function TabBar({ tabs }: { tabs: Tab[] }) {
  return (
    <nav className={s.barra}>
      <div className={s.filas}>
        {tabs.map(({ ruta, texto, icono: Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            end
            className={s.tab}
            onClick={() => haptic()}
          >
            {({ isActive }) => (
              <>
                {/* data-activa en el propio enlace no es accesible desde el render
                    prop, asi que el color lo aplica .tab con :global(.active) */}
                <Icono size={26} weight={isActive ? 'Filled' : 'Outline'} />
                <span className={s.texto}>{texto}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
