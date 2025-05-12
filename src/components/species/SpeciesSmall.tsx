import type { SpeciesName } from "@pkmn/data";
import { defaultGen } from "@/data";
import { ImgUtils } from "@/utils/imgUtils";
import { showSpeciesUnits } from "./showSpeciesUnits";

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
  const pkmn = defaultGen.species.get(name)!;
  const image = ImgUtils.getPokemonIcon(name);

  return (
    <div
      class={`flex items-center aspect-square
        rounded-lg p-1 cursor-pointer border-1 border-gray-400
        ${getCompletionStyle(completion)}`}
      onClick={() => showSpeciesUnits.call({ speciesName: name })}
    >
      <span
        role="img"
        aria-label={ pkmn.name }
        style={ image.css }
      />
    </div>
  )
}
