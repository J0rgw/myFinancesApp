# moneyman

App para controlar tus gastos de la cuenta del banco, ver qué porcentaje de tu
ingreso te gastas cada mes y cuánto necesitas ahorrar para llegar a una meta en
1 mes, 3 meses, 6 meses o 1 año. Todo se guarda solo en tu dispositivo, nada
sale a internet. Está pensada para instalarla como PWA en el móvil.

## Qué hace

- Registra cada gasto e ingreso a mano o importando el CSV del banco.
- Calcula el presupuesto de gasto del mes a partir de tu ingreso menos el ahorro
  que necesitas para tu meta.
- Muestra el porcentaje del ingreso y del presupuesto que llevas gastado.
- Reparte el gasto por categoría con su porcentaje sobre el ingreso y el
  presupuesto.
- Sigue tu ahorro acumulado y estima si llegas a la meta a tu ritmo actual.

## Cómo arrancar en local

Necesitas Node 20.19 o superior (o Node 22.12 o superior).

```
npm install
npm run dev
```

Abre la dirección que aparece en la terminal (por defecto http://localhost:5173).

## Cómo crear la versión para el móvil (PWA)

```
npm run build
npm run preview
```

`npm run preview` levanta la app compilada. Para instalarla en el teléfono como
app necesitas servirla por HTTPS. Dos opciones sencillas:

1. Sube la carpeta `dist` a un hosting estático gratuito como Netlify, Vercel o
   GitHub Pages. Abre la web en el móvil y usa "Añadir a pantalla de inicio".
2. En local, usa `npm run preview -- --host` y entra desde el móvil por la IP de
   tu ordenador. Para instalar como app hace falta HTTPS, así que el hosting es
   la vía más cómoda.

## Cómo importar el extracto del banco

Exporta los movimientos de tu cuenta en formato CSV desde la web de tu banco.
En la pestaña Importar elige el archivo, revisa qué columnas son la fecha, la
descripción y el importe, y confirma. Los importes negativos se guardan como
gasto y los positivos como ingreso. Tienes un archivo de ejemplo en
`ejemplo-banco.csv`.

## Primer uso recomendado

1. Ve a la pestaña Meta y pon tu ingreso mensual, tu ahorro actual, la cantidad
   que quieres alcanzar y en cuánto tiempo.
2. Importa tu CSV del banco o añade gastos a mano en la pestaña Gastos.
3. Mira el Panel para ver porcentajes, categorías y progreso de la meta.

## Detalles técnicos

- React 19 con TypeScript y Vite.
- Interfaz de estilo iOS nativo, animada con Motion.
- Gráficas hechas a mano en SVG, sin librería de gráficas.
- Iconos de Reicon.
- Lectura de CSV con PapaParse.
- PWA con vite-plugin-pwa (funciona sin conexión una vez instalada).
- Datos guardados en localStorage del navegador.
