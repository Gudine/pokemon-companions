import type { IndexNames, StoreKey, StoreNames } from "idb";
import type { PokemonDB } from "../db/db";
import { CACHE, useResource } from "./useResource";

type BaseMap<T extends StoreNames<PokemonDB>> = {
  [Key in IndexNames<PokemonDB, T>]: PokemonDB[T]["indexes"][Key]
} & {
  key: StoreKey<PokemonDB, T>
};

type StaleMap<T extends StoreNames<PokemonDB>> = {
  [Key in keyof BaseMap<T>]?: BaseMap<T>[Key] | BaseMap<T>[Key][]
}

type QueryMap<T extends StoreNames<PokemonDB>> = {
  [Key in keyof BaseMap<T>]?: BaseMap<T>[Key] | IDBKeyRange
}

export function useDBResource<T, U extends StoreNames<PokemonDB>>(
  fn: () => Promise<T>,
  store: U,
  queryMap: QueryMap<U> = {},
  loadOnRefresh = true,
): T {
  const key = `${store}.${JSON.stringify(queryMap)}`;
  
  const resource = useResource(fn, key, loadOnRefresh);
  
  return resource;
}

type Entries<T extends object> = [keyof T, T[keyof T]][];

// Remove export
export function shouldUpdate(staleMap: StaleMap<StoreNames<PokemonDB>>, queryMap: QueryMap<StoreNames<PokemonDB>>) {
  if (!Object.keys(staleMap).length || !Object.keys(queryMap).length) return true;

  const entries = Object.entries(staleMap) as Entries<typeof staleMap>;

  return !entries.some(([key, value]) => {
    if (!(key in queryMap && queryMap[key])) return false;
    
    const queryValue = queryMap[key];
    const staleValues = (Array.isArray(value) ? value : [value!]);

    if (queryValue instanceof IDBKeyRange) {
      return !staleValues.some((staleValue) => queryValue.includes(staleValue))
    }

    return !staleValues.includes(queryValue);
  });
}

export function markDBAsStale<T extends StoreNames<PokemonDB>>(store: T, staleMap: StaleMap<T>): void {
  for (const [cacheKey, cache] of CACHE) {
    if (cacheKey.startsWith(`${store}.`)) {
      const queryMap: QueryMap<T> = JSON.parse(cacheKey.slice(store.length + 1));
      
      if (shouldUpdate(staleMap, queryMap)) cache.update();
    }
  }
}