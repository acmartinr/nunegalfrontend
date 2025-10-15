// context/CartContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

const CartCtx = createContext();
const STORAGE_KEY = "cart_count";

function readCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0; // por si localStorage no está disponible
  }
}

export function CartProvider({ children }) {
  const [count, setCount] = useState(readCount);

  // Guarda siempre que cambia
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(count));
    } catch {
      /* noop */
    }
  }, [count]);

  // Sincroniza otras pestañas/ventanas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const n = Number(e.newValue);
        if (Number.isFinite(n) && n >= 0) setCount(n);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Bump visual en el contador del header (si sube)
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) {
      const el = document.querySelector("#cart-anchor .cart-count");
      if (el) {
        el.classList.remove("bump");
        void el.offsetWidth; // reflow
        el.classList.add("bump");
      }
    }
    prev.current = count;
  }, [count]);

  // Helpers
  const increment = useCallback((n = 1) => {
    setCount((c) => Math.max(0, c + (Number.isFinite(n) ? n : 1)));
  }, []);

  const decrement = useCallback((n = 1) => {
    setCount((c) => Math.max(0, c - (Number.isFinite(n) ? n : 1)));
  }, []);

  const reset = useCallback(() => setCount(0), []);

  const setFromServer = useCallback((n) => {
    const v = Number(n);
    if (Number.isFinite(v) && v >= 0) setCount(v);
  }, []);

  // (opcional) bump manual si lo quieres disparar a demanda
  const bumpCart = useCallback(() => {
    const el = document.querySelector("#cart-anchor .cart-count");
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }, []);

  const value = {
    count,
    setCount, // si la necesitas directa
    increment, // sumas optimistas
    decrement,
    reset,
    setFromServer, // reconciliar con backend
    bumpCart, // manual
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}
