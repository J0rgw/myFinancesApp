import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { crearDemo } from "@/domain/demo";
import {
  AJUSTES_POR_DEFECTO,
  CATEGORIAS_POR_DEFECTO,
  type Ajustes,
  type EstadoApp,
  type MetaCustom,
  type Movimiento,
} from "@/domain/types";

const CLAVE = "moneyman-estado-v1";
const CLAVE_DEMO = "moneyman-demo-v1";

function cargarDemo(): EstadoApp | null {
  try {
    const bruto = sessionStorage.getItem(CLAVE_DEMO);
    if (!bruto) return null;
    const datos = JSON.parse(bruto) as EstadoApp;
    if (!Array.isArray(datos.movimientos) || !datos.ajustes ||
        !Array.isArray(datos.ajustes.categorias) || !Array.isArray(datos.ajustes.metasCustom)) {
      return crearDemo();
    }
    return datos;
  } catch {
    return null;
  }
}

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
  const [espacios, setEspacios] = useState(() => ({ personal: cargar(), demo: cargarDemo() }));
  const { personal, demo } = espacios;
  const esDemo = demo !== null;
  const estado = demo ?? personal;
  const ultimoPersonal = useRef(personal);
  const [errorGuardado, setErrorGuardado] = useState(false);
  const [versionEspacio, setVersionEspacio] = useState(0);

  // Route every existing operation to the active workspace, including CSV import
  // and the existing clear action. Demo data can never reach the personal key.
  const setEstado = useCallback((accion: SetStateAction<EstadoApp>) => {
    setEspacios((prev) => {
      const clave = prev.demo !== null ? 'demo' : 'personal';
      const actual = prev.demo ?? prev.personal;
      return { ...prev, [clave]: typeof accion === 'function' ? accion(actual) : accion };
    });
  }, []);

  useEffect(() => {
    // Reading a saved account (or opening a demo) must not rewrite it.
    if (personal === ultimoPersonal.current) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(personal));
      ultimoPersonal.current = personal;
    } catch {
      // si el almacenamiento falla seguimos en memoria
    }
  }, [personal]);

  useEffect(() => {
    try {
      if (demo) sessionStorage.setItem(CLAVE_DEMO, JSON.stringify(demo));
      else sessionStorage.removeItem(CLAVE_DEMO);
      setErrorGuardado(false);
    } catch {
      setErrorGuardado(true);
    }
  }, [demo]);

  const iniciarDemo = useCallback(() => {
    setEspacios((prev) => ({ ...prev, demo: crearDemo() }));
    setVersionEspacio((v) => v + 1);
  }, []);

  const salirDemo = useCallback(() => {
    setEspacios((prev) => ({ ...prev, demo: null }));
    setVersionEspacio((v) => v + 1);
  }, []);

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
    esDemo,
    errorGuardadoDemo: esDemo && errorGuardado,
    versionEspacio,
    iniciarDemo,
    salirDemo,
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
