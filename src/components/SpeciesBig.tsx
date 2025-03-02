import { Dex, SpeciesName } from "@pkmn/dex";
import { Sprites } from "@pkmn/img";
import { useMemo } from "preact/hooks";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

export function SpeciesBig({ name }: { name: SpeciesName }) {
  const [isVisible, elemRef] = useIntersectionObserver(true);

  const pkmn = useMemo(() => Dex.species.get(name), [name]);

  const image = useMemo(() => Sprites.getPokemon(name, {
    gen: "gen5",
    protocol: window.location.protocol.slice(0, -1) as "http" | "https",
    domain: window.location.host,
  }), [name]);

  return (
    <div
      ref={elemRef}
      class="flex flex-col items-center
        rounded-lg p-2 cursor-pointer
        bg-stone-50 border-gray-400 border-2
        hover:bg-stone-200"
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
