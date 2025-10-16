import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import ProductList from "./pages/ProductList.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import Footer from "./components/Footer.jsx";
export default function App() {
  return (
    <CartProvider>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="*" element={<h2>404 - Not found</h2>} />
        </Routes>
      </main>
      <Footer />
    </CartProvider>
  );
}
