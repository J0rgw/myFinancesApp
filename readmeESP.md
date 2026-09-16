# MoneyMan

**Finanzas personales que se quedan en tu dispositivo.** Entiende en qué gastas y
cómo afecta a tus metas de ahorro, sin conectar una cuenta bancaria ni enviar tus
datos financieros a un servidor.

[English](README.md) · [Repositorio de GitHub](https://github.com/J0rgw/myFinancesApp)

**Demo pública:** _Pendiente de despliegue. Añadir aquí la URL HTTPS cuando exista._

![Panel de MoneyMan con datos ficticios](docs/screenshots/dashboard-mobile.png)

## Qué puedes hacer

- Registrar ingresos y gastos a mano o importar un CSV bancario con vista previa y
  selección de columnas. Los importes negativos son gastos y los positivos,
  ingresos. Los gastos importados usan la categoría elegida (inicialmente Importado).
- Ver el gasto mensual como porcentaje del ingreso o del presupuesto disponible.
- Explorar el reparto por categorías con gráficas SVG propias.
- Definir una meta general a 1, 3, 6 o 12 meses y metas con nombre, importe, ahorro
  ya apartado y plazo propio.
- Consultar una estimación del progreso de ahorro según los movimientos registrados.
- Usar una interfaz móvil con temas claro/oscuro del sistema y ajustes para escritorio.

El presupuesto se calcula restando del ingreso el ahorro mensual que requieren tus
metas. Es una ayuda para planificar, no un saldo bancario ni una predicción financiera.

## Probar sin datos personales

1. En **Panel**, pulsa **Try demo / Probar demo**.
2. Explora **Gastos**, **Meta** e **Importar**.
3. Añade movimientos ficticios o modifica una meta. El aviso identifica la demo activa.
4. Pulsa **Reset demo / Restablecer demo** y confirma para recuperar el ejemplo
   original. Cancelar conserva los cambios.
5. Pulsa **Exit demo / Salir de la demo** para descartar la demo y volver a tus datos.

La demo contiene 12 movimientos ficticios, ocho categorías de gasto y una meta
general más otra con nombre. Los importes e identificadores son deterministas para
cada mes. Las fechas cubren el mes actual, incluso días que todavía pueden ser
futuros. Restablecer genera un ejemplo para el mes actual.

Los datos personales usan la clave existente `moneyman-estado-v1` en `localStorage`.
La demo usa `moneyman-demo-v1` en `sessionStorage`, por separado: añadir movimientos,
importar CSV o editar metas en la demo no sobrescribe los datos personales.
Recargar conserva la demo en esa pestaña si el almacenamiento está disponible;
salir la elimina. Cerrar la pestaña normalmente termina la sesión, aunque el
navegador puede restaurarla. Usa únicamente archivos ficticios en la demo.

La interfaz existente sigue en español. Los controles nuevos de la demo incluyen
inglés y español; la traducción completa con i18n queda para otra fase.

## Privacidad y persistencia

Los movimientos, ajustes y archivos CSV se procesan en el navegador. No hay backend,
cuentas, conexiones bancarias ni analítica integrada. Las fuentes se sirven localmente.
El navegador descarga los archivos de la aplicación desde su alojamiento, que puede
recibir metadatos normales de la petición. La app no sube tus registros financieros.

El almacenamiento local no está cifrado, respaldado ni sincronizado entre dispositivos.
Borrar los datos del sitio elimina los registros; la navegación privada o las
restricciones de almacenamiento pueden limitar su persistencia. Quien acceda al
perfil del navegador puede tener acceso a ellos. **Borrar todos mis datos**, en
Meta, pide confirmación y no se puede deshacer. Se oculta durante la demo.

## Arrancar en local

Usa Node **20.19 o posterior de la rama 20.x, o 22.12 o posterior**, según `package.json`.

```bash
npm install
npm run dev
```

Abre la URL que indica Vite, normalmente `http://localhost:5173`.

```bash
npm run typecheck
npm run build
npm run preview
```

`build` comprueba TypeScript y genera `dist/`; `preview` sirve esa compilación.
El proyecto utiliza React 19, TypeScript, Vite, CSS Modules, Motion,
[Reicon](https://reicon.dev/icons), PapaParse y vite-plugin-pwa. Los cálculos, pantallas
y almacenamiento se organizan en `src/domain`, `src/features` y `src/store`.
La fase 1 no incorpora un framework de pruebas.

## CSV de ejemplo y primer uso personal

[`ejemplo-banco.csv`](ejemplo-banco.csv) es el archivo de ejemplo existente. Entra en
la demo, selecciónalo en **Importar**, revisa las columnas (`Fecha`, `Concepto`,
`Importe`) y confirma los nueve movimientos. Sus fechas son de julio de 2026:
aparecen en **Gastos**, pero solo afectan al panel mensual cuando el mes actual es
julio de 2026. Para un panel del mes actual, usa la demo integrada. Importar el
mismo archivo otra vez añade sus filas de nuevo; no hay detección de duplicados.

Para tus propios registros, sal de la demo, configura ingreso mensual, ahorro inicial
y objetivo en **Meta**; añade movimientos en **Gastos** o importa un CSV. Consulta
**Panel** para ver porcentajes, categorías y progreso.

## Estado de la PWA y alojamiento

El proyecto incluye manifiesto, service worker y caché de la aplicación para uso sin
conexión. Los iconos de instalación están **pendientes**: faltan cinco archivos
referenciados. Consulta [el seguimiento de PWA](docs/pwa-follow-up.md). Compilar sin
errores no demuestra que existan los iconos ni que la instalación funcione.
Reicon aporta los iconos de la interfaz; los de instalación requieren imágenes aparte.

Se conserva `public/images/moneyman.jpg` y se usa en los metadatos de vista previa
social. Sus derivados para instalación y la configuración del favicon quedan pendientes.
Sirve `dist/` por HTTPS para una PWA pública instalable. Con
`npm run preview -- --host` puedes acceder desde un móvil en la red local, pero HTTP
por una dirección LAN normalmente no permite instalación ni service workers.
Hay que comprobar instalación y modo sin conexión en dispositivos reales tras
resolver los iconos.

Las rutas de Vite y del manifiesto presuponen alojamiento en la raíz del dominio.
Para un subdirectorio, como GitHub Pages de un proyecto, revisa base de Vite, URLs
de fuentes e iconos, scope y start URL. Cuando elijas alojamiento, sustituye el
marcador de demo y configura canonical, `og:url` y una URL absoluta para `og:image`.
Este cambio no despliega la web ni hace push a GitHub.

## Capturas y recorrido

Las [capturas de documentación](docs/screenshots/README.md) usan únicamente la demo
generada. Recorrido breve: carga la demo, compara ingresos y gastos, cambia al
porcentaje de presupuesto, revisa categorías, modifica una meta, restablece y sal.

## Limitaciones y hoja de ruta

- Interfaz en español y formato EUR; i18n completo en inglés/español pendiente.
- Persistencia local, sin sincronización, exportación/copia de seguridad ni conexión bancaria.
- Sin detección de duplicados, pagos recurrentes ni presupuestos editables por categoría.
- El panel muestra el mes actual; el historial de movimientos sigue disponible en Gastos.
- Las proyecciones dependen de los datos introducidos; los meses parciales pueden sesgarlas.
- Iconos de instalación PWA y despliegue HTTPS público pendientes.
- Sin suite automatizada ni CI; auditorías completas de accesibilidad y rendimiento pendientes.

Siguiente paso: completar los iconos PWA. Después, la fase 2 incorpora pruebas de
cálculos y CSV, componentes React, un recorrido de navegador, accesibilidad, CI y
revisión Lighthouse/bundle. Más adelante: presupuestos, movimientos recurrentes,
duplicados, comparativas mensuales y exportación/copia de seguridad. i18n completo
se abordará como tarea independiente.
