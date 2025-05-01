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

export function SpeciesSmall({ name, completion }: Props) {
  const showModal = useSignal(false);

  const pkmn = defaultGen.species.get(name)!;
  const image = ImgUtils.getPokemonIcon(name);

  return (
    <>
      <div
        class={`flex items-center aspect-square
          rounded-lg p-1 cursor-pointer border-1 border-gray-400
          ${getCompletionStyle(completion)}`}
        onClick={() => showModal.value = true}
      >
        <span
          role="img"
          aria-label={ pkmn.name }
          style={ image.css }
        />
      </div>
      {showModal.value && createPortal(<SpeciesModal
        close={ () => showModal.value = false }
        speciesName={ name }
      />, document.body)}
    </>
  )
}
