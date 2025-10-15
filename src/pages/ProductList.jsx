import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { fetchProducts } from "../services/api.js";

const PAGE_SIZE = 12;

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
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (p) =>
        (p.brand || "").toLowerCase().includes(q) ||
        (p.model || "").toLowerCase().includes(q)
    );
  }, [query, all]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filtered.slice(start, end);

  const goTo = (n) => setPage(Math.min(Math.max(1, n), totalPages));

  return (
    <section className="product-list">
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

          {/* 🔹 Paginación moderna */}
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
  );
}
