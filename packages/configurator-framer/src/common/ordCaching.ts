import {EqT, Ord, OrdT} from "@viamedici-spc/fp-ts-extensions";
import {Ordering} from "fp-ts/Ordering";

export type OrdCacheProvider = {
    getCache: <T>(eq: EqT<T>, ord: OrdT<T>) => OrdCache<T>
}

export type OrdCache<T> = OrdT<T> & {
    cachedOrderings: ReadonlyArray<{ first: T, second: T, ordering: Ordering }>
};

export function createOrdCache<T>(eq: EqT<T>, ord: OrdT<T>): OrdCache<T> {
    const cachedOrderings: { first: T, second: T, ordering: Ordering }[] = [];

    const getOrAdd = (first: T, second: T) => {
        const existingOrdering = cachedOrderings.find(v => eq.equals(v.first, first) && eq.equals(v.second, second));
        if (existingOrdering) {
            return existingOrdering.ordering;
        }

        const ordering = ord.compare(first, second);
        cachedOrderings.push({first: first, second: second, ordering: ordering});

        return ordering;
    };
    const cachedOrd = Ord.fromCompare(getOrAdd);

    return {
        cachedOrderings: cachedOrderings,
        ...cachedOrd
    };
}

export function createOrdCacheProvider(): OrdCacheProvider {
    const caches: { eq: EqT<unknown>, ord: OrdT<unknown>, ordCache: OrdCache<unknown> }[] = [];

    return {
        getCache: <T>(eq: EqT<T>, ord: OrdT<T>) => {
            const existingCache = caches.find(v => v.eq === eq && v.ord === ord);
            if (existingCache) {
                return existingCache.ordCache as OrdCache<T>;
            }

            const cache = createOrdCache(eq, ord);
            caches.push({eq: eq, ord: ord, ordCache: cache});
            return cache;
        }
    };
}