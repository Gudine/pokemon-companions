// Inspired by https://github.com/preactjs/preact-www/blob/master/src/lib/use-resource.js
import { useState, useEffect } from "preact/hooks";

interface CacheEntry<T> {
  promise?: Promise<T>;
  status: "pending" | "success" | "error" | "refreshing";
  result: T | undefined;
  subscribers: Set<(payload: any) => void>;
  update(): void;
}

export const CACHE = new Map<string, CacheEntry<any>>();

function setupCacheEntry<T>(fn: () => Promise<T>, cacheKey: string) {
	const state: CacheEntry<T> = {
    status: "pending",
    result: undefined,
    subscribers: new Set(),
    update() {
      if (this.promise && (this.status === "pending" || this.status === "refreshing")) return;
      this.status = this.status === "success" ? "refreshing" : "pending";
      this.promise = fn();

      this.subscribers.forEach((update) => update(this.result));
      
      this.promise.then(r => {
        this.status = "success";
        this.result = r;
      }).catch(err => {
        this.status = "error";
        this.result = err;
      }).finally(() => {
        this.subscribers.forEach((update) => update(this.result));
      });
    },
  };
  
  state.update();

	CACHE.set(cacheKey, state);
	return state;
}

export function markAsStale(match: string | RegExp): void {
  const matchFn = match instanceof RegExp ? ((v: string) => match.test(v)) : ((v: string) => v === match);

  for (const [key, value] of CACHE) {
    if (matchFn(key)) value.update();
  }
}

export function useResource<T>(fn: () => Promise<T>, key: string, loadOnRefresh = true): T {
	const update = useState({})[1];

	let state = CACHE.get(key) as CacheEntry<T>;
	if (!state) {
		state = setupCacheEntry(fn, key);
	}

	useEffect(() => {
    state.subscribers.add(update);

		return () => {
      state.subscribers.delete(update);

      if (state.status !== "pending" && (!loadOnRefresh || state.status !== "refreshing")) {
        if (state.subscribers.size === 0) {
          CACHE.delete(key);
        }
      }
		};
	}, [key, state]);

	if (state.status === "success" || (!loadOnRefresh && state.status === "refreshing")) return state.result!;
	else if (state.status === "error") throw state.result;
	throw state.promise!;
}
