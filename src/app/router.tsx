import { createHashRouter, Navigate, Outlet } from 'react-router-dom'
import { Home, Import, Target, Wallet } from 'reicon-react'
import { AppShell } from './AppShell'
import { SheetHost } from './SheetHost'
import { StoreProvider, useStore } from '@/store/StoreContext'
import { TabBar, type Tab } from '@/components/ui/TabBar'
import { PanelScreen } from '@/features/panel/PanelScreen'
import { GastosScreen } from '@/features/gastos/GastosScreen'
import { MetaScreen } from '@/features/meta/MetaScreen'
import { ImportarScreen } from '@/features/importar/ImportarScreen'

const TABS: Tab[] = [
  { ruta: '/panel', texto: 'Panel', icono: Home },
  { ruta: '/gastos', texto: 'Gastos', icono: Wallet },
  { ruta: '/meta', texto: 'Meta', icono: Target },
  { ruta: '/importar', texto: 'Importar', icono: Import },
]

function Espacio() {
  const { esDemo, versionEspacio } = useStore()
  // Discard open forms and CSV previews when switching or resetting workspaces.
  return <SheetHost key={`${esDemo}-${versionEspacio}`}>
    <AppShell>
      <Outlet />
      <TabBar tabs={TABS} />
    </AppShell>
  </SheetHost>
}

function Raiz() {
  return (
    <StoreProvider>
      <Espacio />
    </StoreProvider>
  )
}

/*
 * Hash router a proposito:
 *
 *  - readme.md ofrece GitHub Pages, que no reescribe rutas a index.html.
 *  - Evita los lios de `base` y de precacheo del service worker: /#/gastos pide
 *    "/", que siempre esta en el precache.
 *  - En modo standalone la URL no se ve, asi que no se pierde nada.
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <Raiz />,
    children: [
      { index: true, element: <Navigate to="/panel" replace /> },
      { path: 'panel', element: <PanelScreen /> },
      { path: 'gastos', element: <GastosScreen /> },
      { path: 'meta', element: <MetaScreen /> },
      { path: 'importar', element: <ImportarScreen /> },
      { path: '*', element: <Navigate to="/panel" replace /> },
    ],
  },
])
