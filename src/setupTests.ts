import "@testing-library/jest-dom";

// mock básico de localStorage para aislar tests
const store: Record<string, string> = {};
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => (store[k] = String(v)),
    removeItem: (k: string) => delete store[k],
    clear: () => Object.keys(store).forEach((k) => delete store[k]),
  },
});