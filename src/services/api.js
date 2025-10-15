// services/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://itx-frontend-test.onrender.com/api';

// ====== Cache simple (localStorage + memoria) con TTL de 1h ======
const TTL_MS = 60 * 60 * 1000; // 1 hora
const mem = new Map();

const now = () => Date.now();

function canUseLS() {
  try {
    const k = '__t';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
const LS_OK = canUseLS();

function readLS(key) {
  if (!LS_OK) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null; // { value, expiresAt }
  } catch {
    return null;
  }
}
function writeLS(key, obj) {
  if (!LS_OK) return;
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch { }
}

function cacheGet(key) {
  const m = mem.get(key);
  if (m && m.expiresAt > now()) return m.value;

  const ls = readLS(key);
  if (ls && ls.expiresAt > now()) {
    mem.set(key, ls); // hidrata memoria
    return ls.value;
  }
  return null;
}
function cacheGetWithMeta(key) {
  return mem.get(key) ?? readLS(key) ?? null; // { value, expiresAt }
}
function cacheSet(key, value, ttl = TTL_MS) {
  const payload = { value, expiresAt: now() + ttl };
  mem.set(key, payload);
  writeLS(key, payload);
}

// ====== Helper de red ======
async function jsonFetch(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(`HTTP ${res.status}${msg ? `: ${msg}` : ''}`);
  }
  return res.json();
}
async function safeText(res) {
  try { return await res.text(); } catch { return ''; }
}

// ====== Fetch con cache y TTL ======
async function fetchWithCache(path, key, { force = false, ttl = TTL_MS, init } = {}) {
  const url = `${BASE_URL}${path}`;

  if (!force) {
    const cached = cacheGet(key);
    if (cached) return cached; // válido dentro del TTL

    // si no hay válido, intentamos revalidar
    const meta = cacheGetWithMeta(key); // podría estar expirado
    try {
      const fresh = await jsonFetch(url, init);
      cacheSet(key, fresh, ttl);
      return fresh;
    } catch (e) {
      // si falla red y teníamos algo viejo, devolvemos lo viejo
      if (meta?.value) return meta.value;
      throw e;
    }
  }

  // force: ignora cache, pega a red y reemplaza
  const fresh = await jsonFetch(url, init);
  cacheSet(key, fresh, ttl);
  return fresh;
}

// ====== API pública ======

/**
 * Lista de productos (cache 1h).
 * Uso: fetchProducts() o fetchProducts({ force: true })
 */
export function fetchProducts(opts = {}) {
  return fetchWithCache('/product', 'api:products:all', opts);
}

/**
 * Detalle de producto por id (cache 1h por id).
 * Uso: fetchProductById(id) o fetchProductById(id, { force: true })
 */
export function fetchProductById(id, opts = {}) {
  return fetchWithCache(`/product/${id}`, `api:product:${id}`, opts);
}

/**
 * Añadir al carrito (NO cachea; es transaccional).
 * Si tu backend devuelve { count }, úsalo para actualizar el contador.
 */
export async function addToCart({ id, colorCode, storageCode }) {
  return jsonFetch(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, colorCode, storageCode })
  });
}

// (Opcional) util para limpiar cache por prefijo
export function clearApiCache(prefix = 'api:') {
  // memoria
  for (const k of Array.from(mem.keys())) {
    if (k.startsWith(prefix)) mem.delete(k);
  }
  // localStorage
  if (LS_OK) {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) localStorage.removeItem(k);
    }
  }
}
