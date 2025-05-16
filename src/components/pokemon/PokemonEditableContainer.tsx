import type { RefCallback } from "preact";
import type { IPokemonUnit } from "@/db/db";
import type { PokemonSet } from "@/utils/setUtils";
import { useSignal } from "@preact/signals";
import { FaPencil } from "react-icons/fa6";
import { PokemonBig } from "./PokemonBig";
import { EditPokemonForm } from "./form/EditPokemonForm";

export function PokemonEditableContainer({ unit, pkmn }: { unit?: IPokemonUnit, pkmn: PokemonSet }) {
  const isEditing = useSignal(false);
  
  const checkScroll: RefCallback<HTMLElement> = (elem) => {
    if (unit && elem && window.location.hash === `#${unit.playthrough}.${unit.id}`) {
      window.location.hash = "";
      elem.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  return (
    <div ref={ checkScroll } class="relative">
      {(unit && isEditing.value)
        ? (<EditPokemonForm
          unit={ unit }
          pkmn={ pkmn }
          close={ () => { isEditing.value = false; } }
        />) : (<PokemonBig
          pkmn={ pkmn }
          buttons={unit && (<button
            class="flex cursor-pointer hover:brightness-125"
            onClick={ () => isEditing.value = true }
          >
            <FaPencil title="Edit" />
          </button>)}
        />)}
    </div>
  )
}
