import type { SpeciesName } from "@pkmn/data";
import { defaultGen } from "@/data";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ImgUtils } from "@/utils/imgUtils";

interface Props {
  name: SpeciesName;
  completion: number; // between 0 and 1, inclusive
}

const getCompletionStyle = (completion: number) => completion === 0
  ? "bg-stone-50 hover:bg-stone-200"
  : completion === 1
    ? "bg-indigo-300 hover:bg-indigo-400"
    : "half-completed"

export function SpeciesBig({ name, completion }: Props) {
  const [isVisible, elemRef] = useIntersectionObserver(true);

  const pkmn = defaultGen.species.get(name)!;
  const image = ImgUtils.getPokemon(name);

  return (
    <div
      ref={elemRef}
      class={`flex flex-col items-center
        rounded-lg p-2 cursor-pointer border-2 border-gray-400
        ${getCompletionStyle(completion)}`}
    >
      <span class="self-start font-bold text-xs">
        { `#${pkmn.num}` }
      </span>
      { isVisible.value ? <img
        src={ image.url }
        width={ image.w }
        height={ image.h }
        alt={ pkmn.name }
        style={ { imageRendering: image.pixelated ? "pixelated" : "auto" } }
      /> : <div style={ {
        width: image.w,
        height: image.h
      } }/>}
      <span class="font-bold text-sm">{ pkmn.name }</span>
    </div>
  )
}
