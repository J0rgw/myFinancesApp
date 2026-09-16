// Los formateadores de Intl se crean una sola vez a nivel de modulo: construirlos
// en cada render de una lista larga se nota en el movil.
const formatoEuro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatoEuroCorto = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatoDiaMes = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
});

const formatoDiaCompleto = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function euro(valor: number): string {
  if (!isFinite(valor)) return formatoEuro.format(0);
  return formatoEuro.format(valor);
}

/** Sin decimales. Para titulares grandes, donde ",00" solo estorba. */
export function euroCorto(valor: number): string {
  if (!isFinite(valor)) return formatoEuroCorto.format(0);
  return formatoEuroCorto.format(valor);
}

export function porcentaje(valor: number, decimales = 0): string {
  if (!isFinite(valor)) return "0 %";
  return `${valor.toFixed(decimales)} %`;
}

export function nombreMes(clave: string): string {
  // clave con formato AAAA-MM
  const [anio, mes] = clave.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, 1);
  const texto = fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function claveMes(fechaISO: string): string {
  return fechaISO.slice(0, 7);
}

export function mesActual(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}`;
}

export function fechaHoyISO(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function aFechaLocal(fechaISO: string): Date {
  // new Date("2026-07-16") se interpreta como UTC y en Espana puede caer un dia antes.
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function diasDeDiferencia(fechaISO: string): number {
  const hoy = new Date();
  const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const b = aFechaLocal(fechaISO);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** "Hoy", "Ayer" o la fecha escrita. Para las cabeceras de la lista de movimientos. */
export function fechaRelativa(fechaISO: string): string {
  if (!fechaISO) return "";
  const dias = diasDeDiferencia(fechaISO);
  if (dias === 0) return "Hoy";
  if (dias === -1) return "Ayer";
  const fecha = aFechaLocal(fechaISO);
  const texto = dias > -7 ? formatoDiaCompleto.format(fecha) : formatoDiaMes.format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
