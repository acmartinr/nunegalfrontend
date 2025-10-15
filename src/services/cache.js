const TTL_MS = 60 * 60 * 1000; // 1 hora
const mem = new Map(); // fallback en memoria

function now() { return Date.now(); }

function canUseLS() {
    try {
        const k = "__t";
        localStorage.setItem(k, "1");
        localStorage.removeItem(k);
        return true;
    } catch { return false; }
}

const LS_OK = canUseLS();

function readLS(key) {
    if (!LS_OK) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

function writeLS(key, obj) {
    if (!LS_OK) return;
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch { }
}

export function cacheGet(key) {
    // 1) memoria
    const m = mem.get(key);
    if (m && m.expiresAt > now()) return m.value;

    // 2) localStorage
    const ls = readLS(key);
    if (ls && ls.expiresAt > now()) {
        // refresca memoria
        mem.set(key, ls);
        return ls.value;
    }
    return null;
}

export function cacheGetWithMeta(key) {
    const m = mem.get(key) ?? readLS(key);
    return m ?? null; // { value, expiresAt }
}

export function cacheSet(key, value, ttlMs = TTL_MS) {
    const payload = { value, expiresAt: now() + ttlMs };
    mem.set(key, payload);
    writeLS(key, payload);
}

export function cacheClear(keyPrefix = "") {
    // limpia memoria
    for (const k of mem.keys()) {
        if (k.startsWith(keyPrefix)) mem.delete(k);
    }
    if (!LS_OK) return;
    // limpia LS por prefijo (opcional)
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(keyPrefix)) localStorage.removeItem(k);
    }
}
