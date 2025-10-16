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
  const { items, clearAll } = useCart(); // ⬅️ usa clearAll

  const handleClear = () => {
    if (items.length === 0) return;
    const ok = window.confirm("¿Seguro que quieres vaciar el carrito?");
    if (!ok) return;
    clearAll(); // limpia estado y borra claves de localStorage
    onClose?.();
  };

  // total opcional
  const total = useMemo(
    () =>
      items.reduce(
        (acc, it) => acc + (Number(it.price) || 0) * (Number(it.count) || 1),
        0
      ),
    [items]
  );
  // Portal a body para que se superponga siempre
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
        {/* Header panel */}
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
                    <div style={{ color: "#666", fontSize: 13 }}>
                      x{it.count || 1}
                    </div>
                  </div>
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
                  <div
                    style={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      marginLeft: 8,
                    }}
                  >
                    {currency(it.price)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer con total + Vaciar */}
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

      {/* Responsive: 90% en móvil */}
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
