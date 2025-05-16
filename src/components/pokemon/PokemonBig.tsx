import type { ComponentChildren } from "preact";
import type { PokemonSet } from "@/utils/setUtils";
import { Dex } from "@pkmn/dex";
import { ImgUtils } from "@/utils/imgUtils";
import { batched, graphFunctionBuilder } from "@/utils/miscUtils";
import { Types } from "@/components/common/Types";
import { MoveSmall } from "@/components/move/MoveSmall";
import { MoveInvalid } from "@/components/move/MoveInvalid";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const STAT_ORDER = ["hp", "atk", "def", "spa", "spd", "spe"];

const graphFunction = graphFunctionBuilder(600);

export function PokemonBig({ pkmn, buttons }: { pkmn: PokemonSet, buttons?: ComponentChildren }) {
  const isMediumScreen = useMediaQuery("(width >= 48rem)");

  const { species } = pkmn.data;

  const image = ImgUtils.getPokemon(
    species.name,
    pkmn.isGen(2) && pkmn.shiny,
    (pkmn.isGen(2) && pkmn.gender) || undefined,
  );

  const itemIcon = (pkmn.isGen(2) && pkmn.data.item) ? ImgUtils.getItem(pkmn.data.item.name) : undefined;
  const pokeballIcon = (pkmn.isGen(3) && pkmn.data.pokeball) ? ImgUtils.getItem(pkmn.data.pokeball.name) : undefined;
  
  const dataItems: [string, ComponentChildren][] = [];

  dataItems.push(["Type", <Types types={ species.types } />]);
  dataItems.push(["Level", pkmn.level]);

  if (pkmn.isGen(3)) dataItems.push(["Ability", pkmn.data.ability.name]);

  if (pkmn.isGen(2)) dataItems.push(
    ["Gender", pkmn.gender === "M" ? "Male" : pkmn.gender === "F" ? "Female" : "N/A"],
    ["Held item", (<div class="flex flex-row justify-center items-end gap-0.5">
      {itemIcon && <span class="self-center -m-[2px]" style={ itemIcon.css } />}
      {pkmn.data.item?.name || "No item"}
    </div>)],
    ["Is shiny?", pkmn.shiny ? "True" : "False"],
    ["Happiness", pkmn.happiness ?? "Unspecified"],
  );

  if (pkmn.isGen(3)) dataItems.push(["Pokéball", (<div class="flex flex-row justify-center items-end gap-0.5">
    {pokeballIcon && <span class="self-center -m-[2px]" style={ pokeballIcon.css } />}
    {pkmn.data.pokeball?.name || "Unspecified"}
  </div>)]);

  if (pkmn.isGen(7)) dataItems.push(["Hidden Power type", pkmn.hpType ? <Types types={ [pkmn.data.main.types.get(pkmn.hpType)!.name] } /> : "Unspecified"]);

  if (pkmn.gen === 8 && pkmn.isGen(8)) dataItems.push(
    ["Dynamax level", pkmn.dynamaxLevel ?? "Unspecified"],
    ["G-Max factor", pkmn.gigantamax ? "True" : "False"],
  );

  if (pkmn.isGen(9)) dataItems.push(["Tera type", pkmn.teraType ? <Types types={ [pkmn.data.main.types.get(pkmn.teraType)!.name] } /> : "Unspecified"]);

  const stats = [...pkmn.stats]
    .sort((a, b) => STAT_ORDER.indexOf(a[0]) - STAT_ORDER.indexOf(b[0]))
    .map(([stat, value]) => ({
      id: stat,
      name: pkmn.gen === 1 && stat === "spa" ? "Spc" : Dex.stats.shortNames[stat],
      iv: pkmn.ivs[stat],
      ev: pkmn.evs[stat],
      width: graphFunction(value),
      value,
    }));

  return (
    <article
      class="grid grid-cols-2 grid-rows-[repeat(4,max-content)] content-between gap-1
        rounded-xl p-1 w-80
        md:grid-cols-4 md:grid-rows-[repeat(3,max-content)] md:w-170
        border-4 border-type-unknown-dark bg-type-unknown-light"
      style={{
        backgroundColor: `var(--color-type-${species.types[0].toLowerCase()}-light)`,
        borderColor: `var(--color-type-${(species.types[1] ?? species.types[0]).toLowerCase()}-dark)`,
      }}
    >
      <div class="col-span-full md:col-span-1 grid grid-cols-1 grid-rows-1 *:col-start-1 *:row-start-1">
        <div class="flex flex-col items-center justify-evenly gap-0.5">
          <span
            role="img"
            aria-label={ `${pkmn.isGen(2) && pkmn.shiny ? "Shiny " : ""}${species.name}` }
            title={ `${pkmn.isGen(2) && pkmn.shiny ? "Shiny " : ""}${species.name}` }
            style={ image.css }
            class="rounded-xl bg-gray-100"
          />
          <div class="bg-gray-100 rounded-md w-9/10 px-1 py-0.5 text-center text-sm">
            <span>{ pkmn.name ?? species.name }</span>
          </div>
        </div>
        { buttons && <div
          class="flex flex-col gap-2 justify-self-start text-type-unknown-dark"
          style={ { color: `var(--color-type-${species.types[0].toLowerCase()}-dark)` } }
        >
          { buttons }
        </div> }
      </div>
      <dl class="text-sm text-center col-span-full md:col-span-3
        grid grid-flow-col justify-evenly auto-cols-[minmax(0,50%)] md:auto-cols-[minmax(0,33%)] gap-1">
        {batched(dataItems, isMediumScreen.value ? 3 : 5)
          .map((items) => (<div class="flex flex-col justify-evenly gap-1">
            {items.map(([dtValue, ddValue]) => (<div class={`flex flex-col gap-0.5`}>
              <dt class="text-xs">{dtValue}:</dt>
              <dd>{ddValue}</dd>
            </div>))}
          </div>))}
      </dl>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 items-end
        col-span-full bg-gray-100 rounded-xl p-1">
          {pkmn.data.moves.map((move) => (<MoveSmall move={move} />))}
          {Array<void>(4 - pkmn.moves.length).fill().map(() => (<MoveInvalid />))}
      </div>

      <div class="col-span-full bg-gray-100 p-1 rounded-xl gap-0.5">
        <div class="grid grid-rows-[max-content] auto-rows-fr grid-cols-[max-content_max-content_8fr_1fr_1fr] gap-0.5 rounded-lg overflow-hidden">
          <div class="col-span-full grid grid-cols-subgrid *:bg-type-steel-light">
            <p class="col-span-2  flex items-end justify-center py-0.5">Stats</p>
            <div class="text-center py-0.5">
              {pkmn.isGen(3) && (<>
                <p class="text-xs">Nature:</p>
                <p>{pkmn.data.nature?.name || "Unspecified"}</p>
              </>)}
            </div>
            <p class="flex items-end justify-center py-0.5">EVs</p>
            <p class="flex items-end justify-center py-0.5">IVs</p>
          </div>
          { stats.map(({ id, name, iv, ev, width, value }) => (
            <div class="col-span-full grid grid-cols-subgrid">
              <div
                class="col-span-2 grid grid-cols-subgrid gap-1.5 py-0.5 max-md:text-sm"
                style={{ backgroundColor: `var(--color-stat-${id}-light)` }}
              >
                <p class="text-right pl-1">{name}:</p>
                <p class="text-right pr-1">{value}</p>
              </div>
              <div
                class="p-0.5"
                style={{ backgroundColor: `var(--color-stat-${id}-light)` }}
              >
                <div
                  class={`h-full border-2`}
                  style={{
                    background: width !== 1
                      ? `var(--color-stat-${id})`
                      : `linear-gradient(125deg,
                        var(--color-stat-${id}) 84%, var(--color-stat-${id}-light) 85%,
                        var(--color-stat-${id}-light) 92%, var(--color-stat-${id}) 92%,
                        var(--color-stat-${id}) 94%, var(--color-stat-${id}-light) 95%)`,
                    borderColor: `var(--color-stat-${id}-dark)`,
                    width: `${width * 100}%`,
                  }}
                />
              </div>
              <div
                class="text-center max-md:text-sm"
                style={{ backgroundColor: `var(--color-stat-${id}-light)` }}
              >
                <p class="py-0.5">
                  {ev ?? "--"}
                </p>
              </div>
              <div
                class="text-center max-md:text-sm"
                style={{ backgroundColor: `var(--color-stat-${id}-light)` }}
              >
                <p class="py-0.5">
                  {iv ?? "--"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
