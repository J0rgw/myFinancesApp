# PWA branding follow-up / Seguimiento de iconos PWA

Deferred by request in Phase 1. Reicon interface icons remain unchanged.
Pendiente por decisión de alcance. Los iconos de interfaz de Reicon no cambian.

| Missing file in `public/` | Current reference |
| --- | --- |
| `apple-touch-icon.png` | `index.html` and `vite.config.ts` includeAssets |
| `favicon.svg` | `vite.config.ts` includeAssets; no HTML favicon link exists |
| `icono-192.png` | PWA manifest icons |
| `icono-512.png` | PWA manifest icons |
| `icono-maskable-512.png` | PWA manifest maskable icon |

## Recommended next decision

Use the existing square 736 × 736 JPEG at `public/images/moneyman.jpg` as the
branding source, leaving the original untouched. Derive local PNGs for the
installation sizes, inspect maskable cropping/safe area, and wire a supported
favicon format instead of retaining the nonexistent SVG reference. Reicon React
components are appropriate for UI symbols; they do not supply these manifest files.

Reutilizar el JPEG existente como origen, sin modificarlo. Derivar los PNG de
instalación, comprobar recorte y zona segura del icono maskable y configurar un
favicon válido. Los componentes React de Reicon no generan estos archivos.

## Verification after implementation

- Ensure every HTML and manifest icon path resolves to an image, not Vite's HTML fallback.
- Align manifest name, description and theme settings with the product and current Spanish UI.
- Add the JPEG to precaching if it is used by the installed/offline app; current
  `globPatterns` do not include JPEG files.
- Run typecheck/build and inspect the generated manifest and precache.
- Verify HTTPS installation, launch appearance, safe areas and offline navigation
  on real iOS and Android devices.
- Once a public URL exists, set canonical, og:url and absolute og:image metadata.

Hasta entonces no se da por completada la aceptación de iconos/instalación de PWA,
aunque la compilación finalice correctamente.
