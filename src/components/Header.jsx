import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const { count } = useCart();
  const { pathname } = useLocation();

  // Detectamos si estamos en la raíz o en el detalle
  const isHome = pathname === "/";

  return (
    <header className="header">
      <div className="left">
        {/* Logo / nombre de app siempre lleva al home */}
        <Link to="/" className="brand">
          📱 MobileShop
        </Link>

        {/* Migas de pan dinámicas */}
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
      <div className="cart" id="cart-anchor">
        <span className="cart-icon" aria-hidden>
          🛒
        </span>
        <span className={`cart-count ${count > 0 ? "bump" : ""}`}>{count}</span>
      </div>
    </header>
  );
}
