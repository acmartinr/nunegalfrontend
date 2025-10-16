import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import ShowCart from "../components/ShowCart.jsx";

// 🛒 Importa tu imagen del carrito
import cartImg from "../assets/cart.png";

export default function Header() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isHome = pathname === "/";

  return (
    <>
      <header className="header">
        <div className="left">
          <Link to="/" className="brand">
            📱 ZPhones
          </Link>

          <nav className="breadcrumbs">
            {isHome ? (
              <span>Inicio</span>
            ) : (
              <>
                <Link to="/">Inicio</Link>
                <span> / </span>
                <span>Detalle</span>
              </>
            )}
          </nav>
        </div>

        {/* Carrito persistente */}
        <button
          type="button"
          className="cart"
          id="cart-anchor"
          onClick={() => setIsCartOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isCartOpen}
          aria-label="Abrir carrito"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* 🔄 Imagen del carrito */}
          <img
            src={cartImg}
            alt="Carrito"
            className="cart-icon"
            style={{
              width: 28,
              height: 28,
              objectFit: "contain",
              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.15))",
              transition: "transform 0.2s ease",
            }}
            aria-hidden="true"
          />

          {/* Contador del carrito */}
          <span
            className={`cart-count ${count > 0 ? "bump" : ""}`}
            style={{
              background: "#FF2B5D",
              color: "white",
              borderRadius: "50%",
              fontSize: 12,
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              position: "absolute",
              top: -6,
              right: -10,
              boxShadow: "0 0 4px rgba(0,0,0,0.2)",
            }}
          >
            {count}
          </span>
        </button>
      </header>

      {/* Panel del carrito */}
      <ShowCart open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
