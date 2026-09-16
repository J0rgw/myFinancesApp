/**
 * En Safari de iOS no existe la API de vibracion y no hay ningun sustituto fiable,
 * asi que en el dispositivo objetivo esto no hace nada. Funciona en Android.
 *
 * Existe para no salpicar el codigo de `navigator.vibrate?.()`, no porque se pueda
 * diseñar contando con que haya feedback hactico.
 */
export function haptic(ms = 10): void {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // algunos navegadores lanzan si la pagina no ha tenido interaccion todavia
  }
}
