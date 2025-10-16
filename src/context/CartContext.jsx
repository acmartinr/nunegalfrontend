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
const STORAGE_ITEMS_KEY = "cart_items";

// lee contador
function readCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

// Normaliza items leídos para que siempre tengan "count"
function readItems() {
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((it) => ({
      ...it,
      price: Number(it.price) || 0,
      colorCode: String(it.colorCode ?? ""),
      storageCode: String(it.storageCode ?? ""),
      count:
        Number.isFinite(Number(it.count)) && Number(it.count) > 0
          ? Number(it.count)
          : 1,
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [count, setCount] = useState(readCount);
  const [items, setItems] = useState(readItems);

  // igualdad por name+model+price+colorCode+storageCode
  const sameProduct = (a, b) =>
    (a.name ?? "") === (b.name ?? "") &&
    (a.model ?? "") === (b.model ?? "") &&
    Number(a.price ?? 0) === Number(b.price ?? 0) &&
    String(a.colorCode ?? "") === String(b.colorCode ?? "") &&
    String(a.storageCode ?? "") === String(b.storageCode ?? "");

  // Guarda contador
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(count));
    } catch {}
  }, [count]);

  // Guarda items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Sincroniza otras pestañas/ventanas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const n = Number(e.newValue);
        if (Number.isFinite(n) && n >= 0) setCount(n);
      }
      if (e.key === STORAGE_ITEMS_KEY) {
        try {
          const arr = JSON.parse(e.newValue);
          if (Array.isArray(arr)) setItems(arr);
        } catch {}
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
        void el.offsetWidth;
        el.classList.add("bump");
      }
    }
    prev.current = count;
  }, [count]);

  // ✅ upsert por identidad completa: name+model+price+colorCode+storageCode
  const addOrIncrementItemSummary = useCallback((summary) => {
    setItems((prev) => {
      const normalized = {
        id: String(summary.id ?? ""),
        name: summary.name ?? "",
        model: summary.model ?? "",
        price: Number(summary.price) || 0,
        image: summary.image ?? "",
        colorCode: String(summary.colorCode ?? ""),
        storageCode: String(summary.storageCode ?? ""),
        count: Number(summary.count) > 0 ? Number(summary.count) : 1,
      };

      const idx = prev.findIndex((p) => sameProduct(p, normalized));
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          count: (next[idx].count || 1) + normalized.count,
        };
        return next;
      }
      return [...prev, normalized];
    });
  }, []);

  // (opcional) decrementar una unidad por identidad compuesta
  const decrementItemSummary = useCallback((summaryOrPredicate) => {
    setItems((prev) => {
      let changed = false;
      const next = prev
        .map((p) => {
          const match =
            typeof summaryOrPredicate === "function"
              ? summaryOrPredicate(p)
              : sameProduct(p, summaryOrPredicate);
          if (!match) return p;
          changed = true;
          const newCount = (p.count || 1) - 1;
          return { ...p, count: newCount };
        })
        .filter((p) => (p.count || 1) > 0);
      return changed ? next : prev;
    });
  }, []);

  // Helpers contador
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

  // Remover por id, predicado o identidad compuesta
  const removeItemSummary = useCallback((arg) => {
    setItems((prev) =>
      prev.filter((it) => {
        if (typeof arg === "function") return !arg(it);
        if (typeof arg === "string") return it.id !== arg;
        // objeto con campos -> compara identidad
        return !sameProduct(it, arg || {});
      })
    );
  }, []);

  const clearItems = useCallback(() => setItems([]), []);

  // (opcional) bump manual
  const bumpCart = useCallback(() => {
    const el = document.querySelector("#cart-anchor .cart-count");
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }, []);

  const clearAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_ITEMS_KEY);
    } catch {}
    setCount(0);
    setItems([]);
  }, []);

  const value = {
    // contador
    count,
    setCount,
    increment,
    decrement,
    reset,
    setFromServer,
    bumpCart,
    // items
    items,
    addItemSummary: addOrIncrementItemSummary, // upsert por identidad completa
    removeItemSummary,
    clearItems,
    clearAll,
    // opcional:
    decrementItemSummary,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}
