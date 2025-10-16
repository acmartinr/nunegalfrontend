import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "../../context/CartContext.jsx";
import ProductDetails from "../../pages/ProductDetails.jsx";

vi.mock("../../services/api.js", () => ({
  fetchProductById: vi.fn(async () => ({
    id: "abc",
    brand: "Apple",
    model: "iPhone 15",
    price: 999,
    image: "/p.png",
    options: {
      colors: [{ code: "RED", name: "Rojo" }],
      storages: [{ code: "128", name: "128 GB" }],
    },
  })),
  // 👇 aquí forzamos un error en addToCart
  addToCart: vi.fn(async () => {
    throw new Error("Error al agregar al carrito");
  }),
}));

function renderPage() {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={["/product/abc"]}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    </CartProvider>
  );
}

test("muestra toast cuando addToCart falla", async () => {
  renderPage();

  expect(await screen.findByText(/Apple iPhone 15/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Añadir a la cesta/i }));

  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent(/Fallo al agregar/i)
  );
});
