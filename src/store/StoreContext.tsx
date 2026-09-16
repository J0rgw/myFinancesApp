import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useEstado, type Almacen } from "./almacenamiento";
import {
  gastosPorCategoria,
  metasCustomCalculadas,
  proyeccion,
  resumenDelMes,
  type GastoPorCategoria,
  type MetaCustomCalculada,
  type Proyeccion,
  type ResumenMes,
} from "@/domain/calculos";
import { mesActual } from "@/domain/format";

interface Derivado {
  mes: string;
  resumen: ResumenMes;
  categorias: GastoPorCategoria[];
  proyeccion: Proyeccion;
  metasCustom: MetaCustomCalculada[];
}

type Store = Almacen & { derivado: Derivado };

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const almacen = useEstado();
  const { movimientos, ajustes } = almacen.estado;

  const derivado = useMemo<Derivado>(() => {
    const mes = mesActual();
    const resumen = resumenDelMes(movimientos, ajustes, mes);
    return {
      mes,
      resumen,
      categorias: gastosPorCategoria(movimientos, mes, resumen),
      proyeccion: proyeccion(movimientos, ajustes),
      metasCustom: metasCustomCalculadas(ajustes, resumen.ingresoReferencia),
    };
  }, [movimientos, ajustes]);

  const valor = useMemo<Store>(() => ({ ...almacen, derivado }), [almacen, derivado]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore tiene que usarse dentro de <StoreProvider>");
  return v;
}
