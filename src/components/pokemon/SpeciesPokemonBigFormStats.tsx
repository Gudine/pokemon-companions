import type { UseFormReturn } from "react-hook-form";
import type { StatsTable } from "@pkmn/data";
import { useContext } from "preact/hooks";
import { Dex } from "@pkmn/dex";
import { GenContext } from "@/contexts/GenContext";
import { graphFunctionBuilder } from "@/utils/miscUtils";

const STAT_ORDER = ["hp", "atk", "def", "spa", "spd", "spe"];

const graphFunction = graphFunctionBuilder(600);

export interface SpeciesPokemonBigFormStatsInputs {
  level?: number,
  nature?: string,

  ivs?: Partial<StatsTable>;
  evs?: Partial<StatsTable>;
}

interface Props {
  formHook: UseFormReturn<SpeciesPokemonBigFormStatsInputs>,
  speciesName: string,
}

export function SpeciesPokemonBigFormStats({ formHook, speciesName }: Props) {
  const { register, watch } = formHook;
  const { gen, data } = useContext(GenContext);

  const species = data.species.get(speciesName)!;

  const ivs = watch("ivs");
  const evs = watch("evs");
  const level = watch("level");
  const nature = watch("nature");

  const stats = [...data.stats]
    .sort((a, b) => STAT_ORDER.indexOf(a) - STAT_ORDER.indexOf(b))
    .filter((stat) => gen !== 1 || stat !== "spd")
    .map((stat) => {
      const value = data.stats.calc(
        stat,
        species.baseStats[stat],
        !Number.isNaN(ivs?.[stat]) ? ivs?.[stat] : undefined,
        !Number.isNaN(evs?.[stat]) ? evs?.[stat] : undefined,
        !Number.isNaN(level) ? level : undefined,
        (nature && gen >= 3 && data.natures.get(nature)) || undefined,
      );

      return {
        id: stat,
        name: gen === 1 && stat === "spa" ? "Special" : Dex.stats.mediumNames[stat],
        width: graphFunction(value),
        value,
      };
    });

  return (
    <div class="row-start-3 col-span-full
      bg-gray-100 p-1 rounded-xl gap-0.5">
      <div class="grid grid-rows-[max-content] auto-rows-fr grid-cols-[max-content_max-content_8fr_1fr_1fr] gap-0.5 rounded-lg overflow-hidden">
        <div class="col-span-full grid grid-cols-subgrid *:bg-type-steel-light">
          <div class="text-center col-span-2 pt-0.5 pb-0.5 flex flex-col items-center">
            {gen >= 3 && (<>
              <label for="pokemon-nature" class="text-xs">Nature:</label>
              <select
                id="pokemon-nature"
                class="[text-align:inherit] bg-gray-100 rounded-md max-w-9/10 text-sm w-32 has-[[value='']:checked]:text-stone-400"
                {...register("nature")}
              >
                <option class="text-stone-400" value="">Unspecified</option>
                {[...data.natures].map((nature) => <option class="text-stone-900" value={nature.id}>{nature.name}</option>)}
              </select>
            </>)}
          </div>
          <p class="flex items-end justify-center pt-0.5 pb-0.5">Stats</p>
          <p class="flex items-end justify-center pt-0.5 pb-0.5">EVs</p>
          <p class="flex items-end justify-center pt-0.5 pb-0.5">IVs</p>
        </div>
        { stats.map(({ id, name, width, value }) => (
          <div key={id} class="col-span-full grid grid-cols-subgrid">
            <div
              class="col-span-2 grid grid-cols-subgrid gap-1.5 pt-0.5 pb-0.5"
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
              class="text-center flex justify-center items-center"
              style={{ backgroundColor: `var(--color-stat-${id}-light)` }}
            >
              <input
                class="[text-align:inherit] bg-gray-100 rounded-md pl-2 ml-1 mr-1"
                type="number"
                min={0}
                max={255}
                placeholder="0"
                {...register(`evs.${id}`, {
                  min: { value: 0, message: `${name} EV can't be lower than 0` },
                  max: { value: 255, message: `${name} EV can't be higher than 255` },
                  valueAsNumber: true,
                })}
              />
            </div>
            <div
              class="text-center flex justify-center items-center"
              style={{ backgroundColor: `var(--color-stat-${id}-light)` }}
            >
              <input
                class="[text-align:inherit] bg-gray-100 rounded-md pl-2 ml-1 mr-1"
                type="number"
                min={0}
                max={31}
                placeholder="31"
                {...register(`ivs.${id}`, {
                  min: { value: 0, message: `${name} IV can't be lower than 0` },
                  max: { value: 31, message: `${name} IV can't be higher than 31` },
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
