import type { ComponentChildren } from "preact";
import type { PokemonSet } from "@/utils/setUtils";
import { FaMars, FaVenus } from "react-icons/fa6";
import { ImgUtils } from "@/utils/imgUtils";
import { Types } from "@/components/common/Types";
import { MoveSmall } from "@/components/move/MoveSmall";
import { MoveInvalid } from "@/components/move/MoveInvalid";

export function PokemonSmall({ pkmn }: { pkmn: PokemonSet }) {
  const { species } = pkmn.data;

  const image = ImgUtils.getPokemon(
    species.name,
    pkmn.isGen(2) && pkmn.shiny,
    (pkmn.isGen(2) && pkmn.gender) || undefined,
  );

  const itemIcon = (pkmn.isGen(2) && pkmn.data.item) ? ImgUtils.getItem(pkmn.data.item.name) : undefined;

  const dataItems: [string, ComponentChildren][] = [["Type", <Types types={ species.types } />]];
  if (pkmn.isGen(3)) dataItems.push(["Ability", pkmn.data.ability.name]);
  if (pkmn.isGen(2)) dataItems.push(["Held item", (<div class="flex flex-row justify-center items-end gap-0.5">
    {itemIcon && <span class="self-center" style={ itemIcon.css } />}
    {pkmn.data.item?.name || "No item"}
  </div>)]);

  return (
    <article
      class="grid grid-cols-2 grid-rows-[repeat(2,max-content)] content-between gap-1
        rounded-xl p-1 w-80
        border-4 border-type-unknown-dark bg-type-unknown-light"
      style={{
        backgroundColor: `var(--color-type-${species.types[0].toLowerCase()}-light)`,
        borderColor: `var(--color-type-${(species.types[1] ?? species.types[0]).toLowerCase()}-dark)`,
      }}
    >
      <div class="flex flex-col items-center gap-1">
        <span
          role="img"
          aria-label={ `${pkmn.isGen(2) && pkmn.shiny ? "Shiny " : ""}${species.name}` }
          title={ `${pkmn.isGen(2) && pkmn.shiny ? "Shiny " : ""}${species.name}` }
          style={ image.css }
          class="rounded-xl bg-gray-100"
        />
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
      <dl class="text-sm text-center flex flex-col justify-center gap-1">
        {dataItems.map(([dtValue, ddValue]) => (<div class="flex flex-col gap-0.5">
          <dt class="text-xs">{dtValue}:</dt>
          <dd>{ddValue}</dd>
        </div>))}
      </dl>

      <div class="grid grid-cols-2 grid-rows-[repeat(2,max-content)] gap-2 items-end
        col-span-full bg-gray-100 rounded-xl p-1">
        {pkmn.data.moves.map((move) => (<MoveSmall move={move} />))}
        {Array<void>(4 - pkmn.moves.length).fill().map(() => (<MoveInvalid />))}
      </div>
    </article>
  )
}
