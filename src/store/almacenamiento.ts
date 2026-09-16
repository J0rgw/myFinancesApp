import { useCallback, useEffect, useState } from "react";
import {
  AJUSTES_POR_DEFECTO,
  CATEGORIAS_POR_DEFECTO,
  type Ajustes,
  type EstadoApp,
  type MetaCustom,
  type Movimiento,
} from "@/domain/types";

const CLAVE = "moneyman-estado-v1";

function estadoInicial(): EstadoApp {
  return { movimientos: [], ajustes: { ...AJUSTES_POR_DEFECTO } };
}

/**
 * Lo guardado es una foto de la lista por defecto del dia en que se instalo, asi
 * que una categoria nueva no llegaria nunca a quien ya tiene datos. Se añaden las
 * que falten en vez de pisar la lista: el orden guardado es el que ve el usuario.
 */
function fusionarCategorias(guardadas: unknown): string[] {
  if (!Array.isArray(guardadas) || guardadas.length === 0) {
    return [...CATEGORIAS_POR_DEFECTO];
  }
  const faltan = CATEGORIAS_POR_DEFECTO.filter((c) => !guardadas.includes(c));
  return [...guardadas, ...faltan];
}

function cargar(): EstadoApp {
  try {
    const bruto = localStorage.getItem(CLAVE);
    if (!bruto) return estadoInicial();
    const datos = JSON.parse(bruto) as Partial<EstadoApp>;
    return {
      movimientos: Array.isArray(datos.movimientos) ? datos.movimientos : [],
      ajustes: {
        ...AJUSTES_POR_DEFECTO,
        ...(datos.ajustes || {}),
        categorias: fusionarCategorias(datos.ajustes?.categorias),
        // Los datos guardados antes de existir las metas custom no traen el campo.
        metasCustom: Array.isArray(datos.ajustes?.metasCustom)
          ? datos.ajustes.metasCustom
          : [],
      },
    };
  } catch {
    return estadoInicial();
  }
}

export function useEstado() {
  const [estado, setEstado] = useState<EstadoApp>(cargar);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      // si el almacenamiento falla seguimos en memoria
    }
  }, [estado]);

  const agregarMovimiento = useCallback((mov: Movimiento) => {
    setEstado((prev) => ({ ...prev, movimientos: [mov, ...prev.movimientos] }));
  }, []);

  const agregarVarios = useCallback((movs: Movimiento[]) => {
    setEstado((prev) => ({ ...prev, movimientos: [...movs, ...prev.movimientos] }));
  }, []);

  const borrarMovimiento = useCallback((id: string) => {
    setEstado((prev) => ({
      ...prev,
      movimientos: prev.movimientos.filter((m) => m.id !== id),
    }));
  }, []);

  const actualizarAjustes = useCallback((cambios: Partial<Ajustes>) => {
    setEstado((prev) => ({ ...prev, ajustes: { ...prev.ajustes, ...cambios } }));
  }, []);

  const agregarMetaCustom = useCallback((meta: MetaCustom) => {
    setEstado((prev) => ({
      ...prev,
      ajustes: { ...prev.ajustes, metasCustom: [...prev.ajustes.metasCustom, meta] },
    }));
  }, []);

  const actualizarMetaCustom = useCallback(
    (id: string, cambios: Partial<MetaCustom>) => {
      setEstado((prev) => ({
        ...prev,
        ajustes: {
          ...prev.ajustes,
          metasCustom: prev.ajustes.metasCustom.map((m) =>
            m.id === id ? { ...m, ...cambios } : m
          ),
        },
      }));
    },
    []
  );

  const borrarMetaCustom = useCallback((id: string) => {
    setEstado((prev) => ({
      ...prev,
      ajustes: {
        ...prev.ajustes,
        metasCustom: prev.ajustes.metasCustom.filter((m) => m.id !== id),
      },
    }));
  }, []);

  const reiniciar = useCallback(() => {
    setEstado(estadoInicial());
  }, []);

  return {
    estado,
    agregarMovimiento,
    agregarVarios,
    borrarMovimiento,
    actualizarAjustes,
    agregarMetaCustom,
    actualizarMetaCustom,
    borrarMetaCustom,
    reiniciar,
  };
}

export type Almacen = ReturnType<typeof useEstado>;
