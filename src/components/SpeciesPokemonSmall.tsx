import { useMemo } from "preact/hooks";
import { Dex, GenderName } from "@pkmn/dex";
import { Icons, Sprites } from "@pkmn/img";
import { FaMars, FaVenus } from "react-icons/fa6";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { MoveSmall } from "./MoveSmall";
import { PartialPkmnSet } from "../utils/setUtils";

export function SpeciesPokemonSmall({ pkmn }: { pkmn: PartialPkmnSet }) {
  const [isVisible, elemRef] = useIntersectionObserver(true);

  const species = useMemo(() => Dex.species.get(pkmn.species), [pkmn]);

  const image = useMemo(() => Sprites.getPokemon(species.name, {
    gen: "gen5",
    protocol: window.location.protocol.slice(0, -1) as "http" | "https",
    domain: window.location.host,
    shiny: pkmn.shiny ?? false,
    gender: pkmn.gender as GenderName,
  }), [pkmn]);

  const itemIcon = useMemo(() => {
    const item = Dex.items.get(pkmn.item);
    return item.exists ? Icons.getItem(item.name) : undefined;
  }, [pkmn]);

  const paddedMoves: (string | undefined)[] = useMemo(() => [
    ...(pkmn.moves ?? []),
    ...Array(4 - Math.min((pkmn.moves ?? []).length, 4)).fill(undefined),
  ].slice(0, 4), [pkmn]);

  return (
    <div
      ref={elemRef}
      class="grid grid-cols-2 grid-rows-[repeat(2,max-content)] content-between gap-1
        rounded-xl p-1 w-80
        border-4
        hover:bg-stone-200"
      style={{
        backgroundColor: `var(--color-type-${species.types[0].toLowerCase()}-light)`,
        borderColor: `var(--color-type-${(species.types[1] ?? species.types[0]).toLowerCase()}-dark)`,
      }}
    >
      <div class="flex flex-col items-center gap-1">
        { isVisible.value ? <img
          src={ image.url }
          width={ image.w }
          height={ image.h }
          title={ `${pkmn.shiny ? "Shiny " : ""}${species.name}` }
          alt={ `${pkmn.shiny ? "Shiny " : ""}${species.name}` }
          style={ { imageRendering: image.pixelated ? "pixelated" : "auto" } }
          class="rounded-xl bg-gray-100"
        /> : <div class="rounded-xl bg-gray-100" style={ {
          width: image.w,
          height: image.h
        } } /> }
        <div class="bg-gray-100 rounded-xl w-full
          pb-0.5 pt-0.5 pl-1 pr-1
          text-center text-sm">
          <span class="font-bold">{ pkmn.name || pkmn.species }</span>
          { pkmn.gender === "M" && (
            <span class="text-blue-600 text-xs">&nbsp;<FaMars title="Male" /></span>
          )}
          { pkmn.gender === "F" && (
            <span class="text-pink-400 text-xs">&nbsp;<FaVenus title="Female" /></span>
          )}
          { pkmn.level != null && <>
            <span class="font-bold text-xs"> Lv.</span>
            <span class="font-bold">{pkmn.level}</span>
          </>}
        </div>
      </div>
      <div class="text-sm text-center">
        <p class="text-xs">Type:</p>
        <div class="flex flex-row justify-center">
          {species.types.map((type) => (
            <p
              class="rounded-sm text-white basis-1/2"
              style={{ backgroundColor: `var(--color-type-${type.toLowerCase()})` }}
            >
              {type}
            </p>
          ))}
        </div>
        <p class="text-xs pb-0.5 pt-1">Ability:</p>
        <p>{pkmn.ability || species.abilities[0] || "No ability"}</p>
        <p class="text-xs pb-0.5 pt-1">Held item:</p>
        <p class="flex justify-center items-end gap-0.5">
          {itemIcon && <span class="self-center" style={ itemIcon.css } />}
          {pkmn.item || "No item"}
        </p>
      </div>

      <div class="grid grid-cols-2 grid-rows-[repeat(2,max-content)] gap-2 items-end
        col-span-full bg-gray-100 rounded-xl p-1">
        {paddedMoves.map((move) => (<MoveSmall name={move} />))}
      </div>
    </div>
  )
}
