import type { RefCallback } from "preact";
import type { IPokemonUnit } from "@/db/db";
import type { PokemonSet } from "@/utils/setUtils";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { FaPencil } from "react-icons/fa6";
import { settings } from "@/settings";
import { EditPokemonForm } from "./form/EditPokemonForm";
import { PokemonBig } from "./PokemonBig";
import { PokemonSmall } from "./PokemonSmall";

export function PokemonEditableContainer({ unit, pkmn }: { unit?: IPokemonUnit, pkmn: PokemonSet }) {
  const isEditing = useSignal(false);
  const containerRef = useSignal<HTMLElement | null>(null);
  const isCorner = useSignal<"left" | "right">();
  
  const checkScroll: RefCallback<HTMLElement> = (elem) => {
    containerRef.value = elem;

    if (unit && elem && window.location.hash === `#${unit.playthrough}.${unit.id}`) {
      window.location.hash = "";
      elem.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const elem = containerRef.value;
      if (!elem) return;

      const prev = elem.previousElementSibling as HTMLElement | null;
      const next = elem.nextElementSibling as HTMLElement | null;

      const prevSameRow = prev && prev.offsetLeft < elem.offsetLeft;
      const nextSameRow = next && next.offsetLeft > elem.offsetLeft;

      if (!prevSameRow && nextSameRow) isCorner.value = "left";
      else if (prevSameRow && !nextSameRow) isCorner.value = "right";
      else isCorner.value = undefined;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleClickOutside(ev: MouseEvent) {
    document.body.removeEventListener("click", handleClickOutside);
    
    if (!ev.composedPath().includes(containerRef.value!)) isEditing.value = false;
  };

  useEffect(() => {
    if (isEditing.value) document.body.addEventListener("click", handleClickOutside);
    return () => document.body.removeEventListener("click", handleClickOutside);
  }, [isEditing.value]);

  const PokemonComponent = settings.smallPokemonCards ? PokemonSmall : PokemonBig;

  const positionClass = isCorner.value === "left" ? "-left-2"
    : isCorner.value === "right" ? "-right-2" : "left-1/2 -translate-x-1/2";

  return (
    <div ref={ checkScroll } class="relative">
      <PokemonComponent
        pkmn={ pkmn }
        buttons={unit && (<button
          class="flex cursor-pointer hover:brightness-125"
          onClick={ () => isEditing.value = true }
        >
          <FaPencil title="Edit" />
        </button>)}
      />
      {(unit && isEditing.value) && (
        <div class={`absolute -top-2 z-1 bg-stone-900/75 p-2 rounded-2xl ${positionClass}`}>
          <EditPokemonForm
            unit={ unit }
            pkmn={ pkmn }
            close={ () => { isEditing.value = false; } }
          />
        </div>
      )}
    </div>
  )
}
