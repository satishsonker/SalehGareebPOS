const CACHE_PREFIX = 'app_api_cache:';
const CACHE_VERSION = 1;

// In-memory cache
const memoryCache = new Map();

// Prevent duplicate API requests
const pendingRequests = new Map();

const getStorageKey = (key) => `${CACHE_PREFIX}${key}`;

const isExpired = (entry) => {
    return !entry?.expiresAt || Date.now() >= entry.expiresAt;
};

/**
 * Get cached data
 */
export const getCache = (key) => {
    // Check memory first
    const memoryEntry = memoryCache.get(key);

    if (memoryEntry) {
        if (!isExpired(memoryEntry)) {
            return memoryEntry.data;
        }

        memoryCache.delete(key);
    }

    // Check localStorage
    try {
        const raw = localStorage.getItem(getStorageKey(key));

        if (!raw) {
            return null;
        }

        const entry = JSON.parse(raw);

        if (entry.version !== CACHE_VERSION) {
            localStorage.removeItem(getStorageKey(key));
            return null;
        }

        if (isExpired(entry)) {
            localStorage.removeItem(getStorageKey(key));
            return null;
        }

        // Store in memory for faster access
        memoryCache.set(key, entry);

        return entry.data;
    } catch (error) {
        console.error(`Cache read failed: ${key}`, error);

        try {
            localStorage.removeItem(getStorageKey(key));
        } catch {
            // Ignore
        }

        return null;
    }
};

/**
 * Set cached data
 */
export const setCache = (key, data, expirationMs) => {
    const entry = {
        version: CACHE_VERSION,
        data,
        createdAt: Date.now(),
        expiresAt: Date.now() + expirationMs
    };

    // Memory cache
    memoryCache.set(key, entry);

    // localStorage
    try {
        localStorage.setItem(
            getStorageKey(key),
            JSON.stringify(entry)
        );
    } catch (error) {
        // localStorage may be full/restricted.
        // Memory cache will still work.
        console.warn(
            `Unable to save cache: ${key}`,
            error
        );
    }

    return data;
};

/**
 * Remove one cache
 */
export const removeCache = (key) => {
    memoryCache.delete(key);

    try {
        localStorage.removeItem(getStorageKey(key));
    } catch {
        // Ignore
    }
};

/**
 * Remove all caches starting with a key
 *
 * Example:
 *
 * removeCacheByPrefix('order-prices')
 *
 * removes:
 *
 * order-prices:1:10
 * order-prices:2:10
 * order-prices:3:10
 */
export const removeCacheByPrefix = (prefix) => {
    // Memory
    [...memoryCache.keys()]
        .filter(key => key.startsWith(prefix))
        .forEach(key => {
            memoryCache.delete(key);
        });

    // localStorage
    try {
        const storagePrefix = getStorageKey(prefix);

        Object.keys(localStorage)
            .filter(key => key.startsWith(storagePrefix))
            .forEach(key => {
                localStorage.removeItem(key);
            });
    } catch {
        // Ignore
    }
};

/**
 * Clear ALL application API cache
 */
export const clearCache = () => {
    memoryCache.clear();

    try {
        Object.keys(localStorage)
            .filter(key => key.startsWith(CACHE_PREFIX))
            .forEach(key => {
                localStorage.removeItem(key);
            });
    } catch {
        // Ignore
    }
};

/**
 * Get data from cache.
 *
 * If cache doesn't exist/expired,
 * call API and save result.
 *
 * Duplicate requests are prevented.
 */
export const getOrFetch = async ({
    key,
    fetcher,
    expirationMs,
    forceRefresh = false
}) => {

    // 1. Check cache
    if (!forceRefresh) {
        const cachedData = getCache(key);

        if (cachedData !== null) {
            return cachedData;
        }
    }

    // 2. Same request already running?
    if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
    }

    // 3. Call API
    const request = (async () => {
        try {
            const data = await fetcher();

            // Save API response
            setCache(
                key,
                data,
                expirationMs
            );

            return data;
        } finally {
            pendingRequests.delete(key);
        }
    })();

    pendingRequests.set(key, request);

    return request;
};

export const getCachedApi = async ({
    key,
    fetcher,
    expiration = 5 * 60 * 1000,
    forceRefresh = false
}) => {
    return getOrFetch({
        key,
        fetcher,
        expirationMs: expiration,
        forceRefresh
    });
};