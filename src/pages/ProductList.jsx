import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { fetchProducts } from "../services/api.js";
import BackgroundCarousel from "../components/BackgroundCarousel.jsx";

// 🔹 Importa tus imágenes locales desde /src/assets/
import banner1 from "../assets/banner.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";

// 🔹 Array con tus imágenes locales
const banners = [banner1, banner2, banner3];

const PAGE_SIZE = 12;

const normalize = (s) =>
  (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^\w\s]/g, " ") // quita signos
    .replace(/\s+/g, " ") // colapsa espacios
    .trim()
    .toLowerCase();

export default function ProductList() {
  const [all, setAll] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    fetchProducts()
      .then((data) => {
        if (alive) {
          setAll(data || []);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const filtered = useMemo(() => {
    const nq = normalize(query);
    if (!nq) return all;

    // divide la query en tokens: ["samsung","galaxy"]
    const tokens = nq.split(" ");

    return all.filter((p) => {
      // Combina campos relevantes en una sola cadena buscable
      const haystack = normalize(
        [p.brand, p.model, p.id, p.cpu, p.ram, p.os, p.primaryCamera]
          .filter(Boolean)
          .join(" ")
      );

      // deben aparecer *todas* las palabras de la query (AND)
      return tokens.every((t) => haystack.includes(t));
    });
  }, [query, all]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filtered.slice(start, end);

  const goTo = (n) => setPage(Math.min(Math.max(1, n), totalPages));

  return (
    <div className="hero-wrap">
      {/* 🔹 Carrusel de fondo */}
      <BackgroundCarousel
        images={banners}
        interval={5000}
        height={260} // alto escritorio
        heightMobile={140} // alto móvil
      />

      {/* 🔹 Contenido superpuesto */}
      <section className="content-over-hero product-list">
        <SearchBar value={query} onChange={setQuery} />

        {loading ? (
          <p className="loading">Cargando…</p>
        ) : (
          <>
            <div className="grid">
              {pageItems.map((p) => (
                <ProductCard
                  key={p.id}
                  item={p}
                  onClick={() => navigate(`/product/${p.id}`)}
                />
              ))}
            </div>

            <nav className="pagination">
              <button
                className="nav-btn"
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => goTo(n)}
                  className={`page-btn ${n === page ? "active" : ""}`}
                >
                  {n}
                </button>
              ))}

              <button
                className="nav-btn"
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
              >
                →
              </button>
            </nav>
          </>
        )}
      </section>
    </div>
  );
}
