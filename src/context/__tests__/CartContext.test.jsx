import React from "react";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../CartContext.jsx";

function wrapper({ children }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("CartContext (contador + items upsert)", () => {
  test("incrementa contador y persiste en localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.increment(2));
    expect(result.current.count).toBe(2);
    expect(window.localStorage.getItem("cart_count")).toBe("2");
  });

  test("addItemSummary hace upsert por identidad compuesta e incrementa count", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const base = {
      id: "p1",
      name: "Apple",
      model: "iPhone 15",
      price: 999,
      image: "/img.png",
      colorCode: "RED",
      storageCode: "128",
    };

    act(() => result.current.addItemSummary(base));
    act(() => result.current.addItemSummary(base));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].count).toBe(2);

    act(() => result.current.addItemSummary({ ...base, storageCode: "256" }));
    expect(result.current.items).toHaveLength(2);
  });

  test("3 productos (2 iguales + 1 distinto): grupos=2; counts 2 y 1; contador general=2", () => {
    window.localStorage.clear();

    const { result } = renderHook(() => useCart(), { wrapper });

    const base = {
      id: "p1",
      name: "Apple",
      model: "iPhone 15",
      price: 999,
      image: "/img.png",
      colorCode: "RED",
      storageCode: "128",
    };

    act(() => {
      result.current.addItemSummary(base);
      result.current.addItemSummary(base);

      result.current.addItemSummary({ ...base, storageCode: "256" });
    });

    expect(result.current.items).toHaveLength(2);

    const grupo128 = result.current.items.find(
      (it) => it.storageCode === "128"
    );
    const grupo256 = result.current.items.find(
      (it) => it.storageCode === "256"
    );

    expect(grupo128).toBeTruthy();
    expect(grupo256).toBeTruthy();

    expect(grupo128.count).toBe(2);
    expect(grupo256.count).toBe(1);

    act(() => {
      result.current.setFromServer(result.current.items.length);
    });

    expect(result.current.count).toBe(2);
    expect(window.localStorage.getItem("cart_count")).toBe("2");

    const raw = window.localStorage.getItem("cart_items");
    const arr = JSON.parse(raw || "[]");
    const s128 = arr.find((x) => x.storageCode === "128");
    const s256 = arr.find((x) => x.storageCode === "256");
    expect(s128?.count).toBe(2);
    expect(s256?.count).toBe(1);
  });

  test("clearAll limpia contador e items y reinicia localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.increment(2);
      result.current.addItemSummary(
        {
          id: "p1",
          name: "Apple",
          model: "iPhone 15",
          price: 999,
          image: "/img.png",
          colorCode: "RED",
          storageCode: "128",
        },
        {
          id: "p2",
          name: "Android",
          model: "Galaxy S24",
          price: 1300,
          image: "/img2.png",
          colorCode: "BLUE",
          storageCode: "256",
        }
      );
    });

    act(() => result.current.clearAll());

    expect(result.current.count).toBe(0);
    expect(result.current.items).toHaveLength(0);

    expect(window.localStorage.getItem("cart_count")).toBe("0");
    expect(window.localStorage.getItem("cart_items")).toBe("[]");
  });
});
