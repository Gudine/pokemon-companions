import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

export function useIntersectionObserver(oneTime: boolean = false) {
  const isVisible = useSignal(false);
  const elemRef = useRef(null);

  useEffect(() => {
    let observer: IntersectionObserver;

    if (elemRef.current && (!oneTime || !isVisible.peek())) {
      observer = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
          isVisible.value = entry.isIntersecting;

          if (entry.isIntersecting && oneTime) obs.disconnect();
        }
      }, { rootMargin: "100%" });

      observer.observe(elemRef.current);
    }

    return () => {
      observer.disconnect();
    }
  }, [elemRef, isVisible]);

  return [isVisible, elemRef] as const;
}
