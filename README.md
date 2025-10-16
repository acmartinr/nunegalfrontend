# MobileShop (React)

Mini SPA de catálogo de móviles (PLP/PDP) hecha con React + Vite.

## Requisitos

- Node 18+

## Arranque

```bash
npm install
npm run dev   # (alias: npm start)
```

Abrir el navegador en la url http://localhost:5173/

La app espera un API con estas rutas (configurable con `VITE_API_BASE_URL` en `.env`):

- `GET /product` → lista de productos
- `GET /products/:id` → detalle de producto
- `POST /cart` → body `{ id, colorCode, storageCode }` y responde `{ count }`

Ejemplo `.env`:

```
VITE_API_BASE_URL=http://localhost:3001
```

## Scripts

- `npm run start` / `dev` → modo desarrollo.
- `npm run build` → producción.
- `npm run test` → tests con Vitest.
- `npm run lint` → ESLint.

## Notas de diseño

- Header fijo con _breadcrumbs_ y contador de carrito.
- PLP con grid responsive (máx 4 por fila).
- Búsqueda en tiempo real por marca y modelo.
- PDP en dos columnas: imagen y panel de descripción/acciones.
- Selectores de color y almacenamiento (preseleccionados).
- Botón "Añadir" que actualiza el contador global y persiste el producto en `localStorage`.
