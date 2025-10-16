// src/components/ShowCart.jsx
import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../context/CartContext.jsx";

function currency(n = 0) {
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(n || 0);
  } catch {
    return `${n} €`;
  }
}

export default function ShowCart({ open, onClose }) {
  const { items, clearAll } = useCart();

  const handleClear = () => {
    if (items.length === 0) return;
    const ok = window.confirm("¿Seguro que quieres vaciar el carrito?");
    if (!ok) return;
    clearAll();
    onClose?.();
  };

  // Detecta si un valor es un color CSS válido
  const isCssColor = (value) => {
    if (!value) return false;
    const s = document.createElement("span").style;
    s.backgroundColor = "";
    s.backgroundColor = value;
    return s.backgroundColor !== "";
  };

  // util: quitar tildes y normalizar texto
  const normalizeColorKey = (str = "") =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quita acentos
      .toLowerCase()
      .trim();

  // obtiene el color real, incluso si viene con tildes o espacios
  const resolveColor = (item) => {
    const val = item?.colorCode || item?.colorName || ""; // usa cualquiera disponible

    // 1️⃣ si ya es un color CSS válido (#fff, rgb(), etc.)
    if (isCssColor(val)) return val;

    // 2️⃣ normaliza texto (sin tildes, lowercase)
    const key = normalizeColorKey(val);

    // 3️⃣ busca en mapa extendido
    const COLOR_MAP = {
      red: "#FF0000",
      rojo: "#FF0000",
      black: "#000000",
      negro: "#000000",
      white: "#FFFFFF",
      blanco: "#FFFFFF",
      blue: "#007BFF",
      azul: "#007BFF",
      green: "#28A745",
      verde: "#28A745",
      gray: "#808080",
      gris: "#808080",
      "space gray": "#4A4A4A",
      "gris oscuro": "#4A4A4A",
      silver: "#C0C0C0",
      plata: "#C0C0C0",
      gold: "#D4AF37",
      dorado: "#D4AF37",
    };

    // 4️⃣ si encuentra coincidencia
    if (COLOR_MAP[key]) return COLOR_MAP[key];

    // 5️⃣ si tiene palabra "gray" o "gris" en el texto
    if (/gris|gray/.test(key)) return "#808080";

    // 6️⃣ fallback
    return "#ccc";
  };

  // Total general
  const total = useMemo(
    () =>
      items.reduce(
        (acc, it) => acc + (Number(it.price) || 0) * (Number(it.count) || 1),
        0
      ),
    [items]
  );

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 200ms ease",
          zIndex: 9998,
        }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "25vw",
          minWidth: 320,
          maxWidth: 520,
          background: "#fff",
          boxShadow: "0 0 24px rgba(0,0,0,0.2)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 260ms ease",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
          }}
        >
          <strong style={{ fontSize: 18 }}>Tu carrito</strong>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              border: "none",
              background: "transparent",
              fontSize: 22,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Lista de productos */}
        <div style={{ overflow: "auto", padding: 12, flex: 1 }}>
          {items.length === 0 ? (
            <p style={{ padding: 12, color: "#666" }}>
              Aún no tienes productos.
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((it, idx) => (
                <li
                  key={`${it.id}-${idx}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px 1fr auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 8px",
                    borderBottom: "1px solid #f1f1f1",
                  }}
                >
                  <img
                    src={it.image}
                    alt={`${it.name} ${it.model}`}
                    width={72}
                    height={72}
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 10,
                      background: "#fafafa",
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {it.name} {it.model}
                    </div>

                    {/* Color */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <span
                        title={it.colorName || it.colorCode}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          backgroundColor: resolveColor(it),
                          border: "1px solid rgba(0,0,0,0.15)",
                          display: "inline-block",
                        }}
                      />
                      <span style={{ color: "#555", fontSize: 13 }}>
                        {it.colorName || it.colorCode}
                      </span>
                    </div>

                    {/* Capacidad */}
                    <div style={{ color: "#777", fontSize: 13 }}>
                      {it.storageName || it.storageCode}
                    </div>

                    {/* Cantidad */}
                    <div style={{ color: "#666", fontSize: 13 }}>
                      x{it.count || 1}
                    </div>
                  </div>

                  {/* Precio */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {currency(it.price)}
                    </div>
                    <div style={{ fontSize: 12, color: "#777" }}>
                      Subtotal:{" "}
                      {currency(
                        (Number(it.price) || 0) * (Number(it.count) || 1)
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            <span style={{ color: "#555", marginRight: 8 }}>Total</span>
            <strong>{currency(total)}</strong>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={items.length === 0}
            style={{
              background: items.length ? "#e53935" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: items.length ? "pointer" : "not-allowed",
              fontWeight: 600,
            }}
            title={items.length ? "Vaciar carrito" : "Carrito vacío"}
          >
            Vaciar carrito
          </button>
        </div>
      </aside>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          aside[role="dialog"] {
            width: 90vw !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </>,
    document.body
  );
}
