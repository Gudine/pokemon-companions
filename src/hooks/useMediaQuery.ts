import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export function useMediaQuery(query: string) {
  const matches = useSignal(matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = matchMedia(query);
    const callback = (ev: MediaQueryListEvent) => matches.value = ev.matches;

    mediaQuery.addEventListener("change", callback);

    return () => mediaQuery.removeEventListener("change", callback);
  }, [matches]);

  return matches;
}
