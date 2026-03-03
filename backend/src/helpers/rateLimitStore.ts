interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export const getRateLimitEntry = (key: string, windowMs: number): RateLimitEntry => {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        const newEntry: RateLimitEntry = { count: 0, resetAt: now + windowMs };
        store.set(key, newEntry);
        return newEntry;
    }

    return entry;
};

export const incrementCount = (key: string): void => {
    const entry = store.get(key);
    if (entry) entry.count++;
};

// Limpiar entradas expiradas cada 10 minutos
setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
        if (now > entry.resetAt) store.delete(key);
    });
}, 10 * 60 * 1000);
