import type { SpeciesName } from "@pkmn/data";
import { defaultGen } from "@/data";
import { ImgUtils } from "@/utils/imgUtils";
import { useSignal } from "@preact/signals";
import { createPortal } from "preact/compat";
import { SpeciesModal } from "./SpeciesModal";

interface Props {
  name: SpeciesName;
  completion: number; // between 0 and 1, inclusive
}

const getCompletionStyle = (completion: number) => completion === 0
  ? "bg-stone-50 hover:bg-stone-200"
  : completion === 1
    ? "bg-indigo-200 hover:bg-indigo-300"
    : "half-completed"

export function SpeciesBig({ name, completion }: Props) {
  const showModal = useSignal(false);

  const pkmn = defaultGen.species.get(name)!;
  const image = ImgUtils.getPokemon(name);

  return (
    <>
      <div
        class={`flex flex-col items-center
          rounded-lg p-2 cursor-pointer border-2 border-gray-400
          ${getCompletionStyle(completion)}`}
        onClick={() => showModal.value = true}
      >
        <span class="self-start font-bold text-xs">
          { `#${pkmn.num}` }
        </span>
        <span
          role="img"
          aria-label={ pkmn.name }
          style={ image.css }
        />
        <span class="font-bold text-sm">{ pkmn.name }</span>
      </div>
      {showModal.value && createPortal(<SpeciesModal
        close={ () => showModal.value = false }
        speciesName={ name }
      />, document.body)}
    </>
  )
}
