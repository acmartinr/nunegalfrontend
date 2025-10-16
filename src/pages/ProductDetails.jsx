// ProductDetails.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useRef as useRefAlias,
} from "react";
import { Link, useParams } from "react-router-dom";
import { addToCart, fetchProductById } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetails() {
  const { id } = useParams();

  const { increment, bumpCart, addItemSummary } = useCart();

  const [item, setItem] = useState(null);
  const [color, setColor] = useState("");
  const [capacity, setCapacity] = useState("");
  const imgRef = useRef(null);

  // --- Toast state ---
  const [toast, setToast] = useState({ visible: false, message: "" });
  const toastTimerRef = useRefAlias(null);
  const showErrorToast = (msg = "Fallo al agregar al carrito") => {
    setToast({ visible: true, message: msg });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2500);
  };

  useEffect(() => {
    fetchProductById(id).then((data) => {
      setItem(data);
      setColor(data?.options?.colors?.[0]?.code || "");
      setCapacity(data?.options?.storages?.[0]?.code || "");
    });
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [id]);

  const flyToCart = () => {
    const startEl = imgRef.current;
    const endEl = document.getElementById("cart-anchor");
    if (!startEl || !endEl) return;

    const start = startEl.getBoundingClientRect();
    const end = endEl.getBoundingClientRect();

    const clone = startEl.cloneNode(true);
    clone.classList.add("flyer");
    // aseguremos estilos por si no existe la clase .flyer en tu CSS
    Object.assign(clone.style, {
      position: "fixed",
      left: `${start.left}px`,
      top: `${start.top}px`,
      width: `${start.width}px`,
      height: `${start.height}px`,
      transition: "transform 500ms ease, opacity 500ms ease, filter 500ms ease",
      zIndex: 99999,
      pointerEvents: "none",
    });
    document.body.appendChild(clone);

    const translateX =
      end.left + end.width / 2 - (start.left + start.width / 2);
    const translateY =
      end.top + end.height / 2 - (start.top + start.height / 2);

    // forzar frame
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    clone.offsetWidth;

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.2)`;
      clone.style.opacity = "0.4";
      clone.style.filter = "blur(0.5px)";
    });

    clone.addEventListener(
      "transitionend",
      () => {
        clone.remove();
        const cartIcon = endEl.querySelector(".cart-icon");
        if (cartIcon) {
          cartIcon.classList.remove("flash");
          // reflow
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          cartIcon.offsetWidth;
          cartIcon.classList.add("flash");
        }
        bumpCart();
      },
      { once: true }
    );
  };

  const onAdd = async () => {
    if (!color || !capacity) {
      showErrorToast("Selecciona color y almacenamiento");
      return;
    }

    try {
      const res = await addToCart({
        id,
        colorCode: color,
        storageCode: capacity,
      });

      // contador total
      if (typeof res?.count === "number" && res.count >= 0) {
        increment(1);
      }

      // resumen (name=marca, model, price, image)
      addItemSummary({
        id: String(id),
        name: item.brand ?? "",
        model: item.model ?? "",
        price: Number(item.price) || 0,
        image:
          item.imgUrl ||
          item.image ||
          "https://via.placeholder.com/400x300?text=Phone",
        // count: 1 // opcional; por defecto 1
      });

      flyToCart();
    } catch (e) {
      showErrorToast("Fallo al agregar al carrito");
    }
  };

  if (!item) return <p style={{ padding: 16 }}>Cargando…</p>;

  return (
    <section style={{ position: "relative" }}>
      {/* Toast rojo */}
      {toast.visible && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 99999,
            background: "#e53935",
            color: "#fff",
            padding: "12px 14px",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(229,57,53,0.5)",
            fontWeight: 600,
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="back-container">
        <Link to="/" className="back-btn">
          ← Volver al listado
        </Link>
      </div>

      <div className="row">
        <div className="box">
          <img
            ref={imgRef}
            src={
              item.imgUrl ||
              item.image ||
              "https://via.placeholder.com/400x300?text=Phone"
            }
            alt={item.model}
            style={{ width: "100%", height: "auto", maxWidth: 420 }}
          />
        </div>

        <div>
          <div className="box" style={{ marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>
              {item.brand} {item.model}
            </h2>
            <ul>
              <li>
                <b>Precio:</b>{" "}
                {Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(item.price || 0)}
              </li>
              {item.cpu && (
                <li>
                  <b>CPU:</b> {item.cpu}
                </li>
              )}
              {item.ram && (
                <li>
                  <b>RAM:</b> {item.ram}
                </li>
              )}
              {item.os && (
                <li>
                  <b>Sistema:</b> {item.os}
                </li>
              )}
              {item.displayResolution && (
                <li>
                  <b>Resolución:</b> {item.displayResolution}
                </li>
              )}
              {item.battery && (
                <li>
                  <b>Batería:</b> {item.battery}
                </li>
              )}
              {item.primaryCamera && (
                <li>
                  <b>Cámaras:</b> {item.primaryCamera}
                </li>
              )}
              {item.dimentions && (
                <li>
                  <b>Dimensiones:</b> {item.dimentions}
                </li>
              )}
              {item.weight && (
                <li>
                  <b>Peso:</b> {item.weight} g
                </li>
              )}
            </ul>
          </div>

          <div className="box actions">
            <div className="selects">
              <label>
                Color
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                >
                  {(item.options?.colors || []).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Almacenamiento
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                >
                  {(item.options?.storages || []).map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="primary"
              style={{ cursor: "pointer" }}
              onClick={onAdd}
              disabled={!color || !capacity}
              title={!color || !capacity ? "Selecciona opciones" : "Añadir"}
            >
              Añadir a la cesta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
