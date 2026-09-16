// Vive aparte de almacenamiento.ts para que domain/ no dependa de store/:
// csv.ts necesita generar ids y no puede importar un modulo con hooks de React.
export function nuevoId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
