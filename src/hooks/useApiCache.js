import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import {
    getCache,
    getOrFetch,
    removeCache,
    setCache
} from '../cache/apiCache';


const useApiCache = ({
    key,
    fetcher,

    // Default cache = 5 minutes
    expiration = 5 * 60 * 1000,

    // Whether API call should happen
    enabled = true
}) => {

    const mountedRef = useRef(true);

    // Get initial cached data
    const initialData = getCache(key);

    const [data, setData] = useState(initialData);

    const [loading, setLoading] = useState(
        initialData === null
    );

    const [error, setError] = useState(null);

    const [isRefreshing, setIsRefreshing] = useState(false);


    // Track component mounted state
    useEffect(() => {

        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };

    }, []);


    /**
     * Fetch data
     */
    const execute = useCallback(
        async (forceRefresh = false) => {

            if (!enabled) {
                return null;
            }

            try {

                setError(null);

                // ----------------------------------
                // Check cache
                // ----------------------------------

                if (!forceRefresh) {

                    const cachedData = getCache(key);

                    if (cachedData !== null) {

                        if (mountedRef.current) {
                            setData(cachedData);
                            setLoading(false);
                        }

                        return cachedData;
                    }
                }


                // ----------------------------------
                // Loading state
                // ----------------------------------

                if (mountedRef.current) {

                    if (data === null) {
                        setLoading(true);
                    } else {
                        setIsRefreshing(true);
                    }
                }


                // ----------------------------------
                // API call
                // ----------------------------------

                const result = await getOrFetch({
                    key,
                    fetcher,
                    expirationMs: expiration,
                    forceRefresh
                });


                // ----------------------------------
                // Update state
                // ----------------------------------

                if (mountedRef.current) {

                    setData(result);

                    setLoading(false);

                    setIsRefreshing(false);
                }

                return result;

            } catch (err) {

                if (mountedRef.current) {

                    setError(err);

                    setLoading(false);

                    setIsRefreshing(false);
                }

                throw err;
            }

        },
        [
            key,
            fetcher,
            expiration,
            enabled,
            data
        ]
    );


    // ----------------------------------
    // Initial load
    // ----------------------------------

    useEffect(() => {

        if (!enabled) {
            return;
        }

        execute();

    }, [
        execute,
        enabled
    ]);


    /**
     * Force refresh API
     */
    const refresh = useCallback(() => {
        return execute(true);
    }, [execute]);


    /**
     * Remove cache
     */
    const invalidate = useCallback(() => {

        removeCache(key);

        if (mountedRef.current) {
            setData(null);
        }

    }, [key]);


    /**
     * Update cache manually
     *
     * Useful after POST/PUT/PATCH
     */
    const updateCache = useCallback(
        (newData) => {

            setCache(
                key,
                newData,
                expiration
            );

            if (mountedRef.current) {
                setData(newData);
            }

        },
        [
            key,
            expiration
        ]
    );


    return {
        data,

        loading,

        isRefreshing,

        error,

        refresh,

        invalidate,

        updateCache
    };
};

export default useApiCache;