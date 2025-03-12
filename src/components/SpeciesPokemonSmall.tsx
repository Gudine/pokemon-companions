import { FaMars, FaVenus } from "react-icons/fa6";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { MoveSmall } from "./MoveSmall";
import { PokemonSet } from "../utils/setUtils";
import { ImgUtils } from "../utils/imgUtils";
import { MoveInvalid } from "./MoveInvalid";

export function SpeciesPokemonSmall({ pkmn }: { pkmn: PokemonSet }) {
  const [isVisible, elemRef] = useIntersectionObserver(true);
  
  const { species } = pkmn.data;

  const image = ImgUtils.getPokemon(
    species.name,
    pkmn.isGen(2) && pkmn.shiny,
    (pkmn.isGen(2) && pkmn.gender) || undefined,
  );

  const itemIcon = (pkmn.isGen(2) && pkmn.data.item) ? ImgUtils.getItem(pkmn.data.item.name) : undefined;

  return (
    <article
      ref={elemRef}
      class="grid grid-cols-2 grid-rows-[repeat(2,max-content)] content-between gap-1
        rounded-xl p-1 w-80
        border-4 border-type-unknown-dark bg-type-unknown-light
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
          title={ `${pkmn.isGen(2) && pkmn.shiny ? "Shiny " : ""}${species.name}` }
          alt={ `${pkmn.isGen(2) && pkmn.shiny ? "Shiny " : ""}${species.name}` }
          style={ { imageRendering: image.pixelated ? "pixelated" : "auto" } }
          class="rounded-xl bg-gray-100"
        /> : <div class="rounded-xl bg-gray-100" style={ {
          width: image.w,
          height: image.h
        } } /> }
        <div class="bg-gray-100 rounded-xl w-full
          pb-0.5 pt-0.5 pl-1 pr-1
          text-center text-sm">
          <span class="font-bold">{ pkmn.name || species.name }</span>
          {pkmn.isGen(2) && (<>
            { pkmn.gender === "M" && (
              <span class="text-blue-600 text-xs">&nbsp;<FaMars title="Male" /></span>
            )}
            { pkmn.gender === "F" && (
              <span class="text-pink-400 text-xs">&nbsp;<FaVenus title="Female" /></span>
            )}
          </>)}
          <span class="font-bold text-xs"> Lv.</span>
          <span class="font-bold">{pkmn.level}</span>
        </div>
      </div>
      <div class="text-sm text-center">
        <p class="text-xs">Type:</p>
        <div class="flex flex-row justify-center">
          {species.types.map((type) => (
            <p
              class="rounded-sm text-white basis-1/2 bg-type-unknown"
              style={{ backgroundColor: `var(--color-type-${type.toLowerCase()})` }}
            >
              {type}
            </p>
          ))}
        </div>
        {pkmn.isGen(3) && (<>
          <p class="text-xs pb-0.5 pt-1">Ability:</p>
          <p>{pkmn.data.ability.name}</p>
        </>)}
        {pkmn.isGen(2) && (<>
          <p class="text-xs pb-0.5 pt-1">Held item:</p>
          <p class="flex justify-center items-end gap-0.5">
            {itemIcon && <span class="self-center" style={ itemIcon.css } />}
            {pkmn.data.item?.name || "No item"}
          </p>
        </>)}
      </div>

      <div class="grid grid-cols-2 grid-rows-[repeat(2,max-content)] gap-2 items-end
        col-span-full bg-gray-100 rounded-xl p-1">
        {pkmn.data.moves.map((move) => (<MoveSmall move={move} />))}
        {Array<void>(4 - pkmn.moves.length).fill().map(() => (<MoveInvalid />))}
      </div>
    </article>
  )
}
