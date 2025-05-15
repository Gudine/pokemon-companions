import type { UseFormReturn } from "react-hook-form";
import type { Specie, StatsTable } from "@pkmn/data";
import { useContext } from "preact/hooks";
import { Dex } from "@pkmn/dex";
import { GenContext } from "@/contexts/GenContext";
import { graphFunctionBuilder } from "@/utils/miscUtils";
import { getStats } from "@/utils/pkmnUtils";

const STAT_ORDER = ["hp", "atk", "def", "spa", "spd", "spe"];

const graphFunction = graphFunctionBuilder(600);

export interface PokemonBigFormStatsInputs {
  level?: number,
  nature?: string,

  ivs?: Partial<StatsTable>;
  evs?: Partial<StatsTable>;
}

interface Props {
  formHook: UseFormReturn<PokemonBigFormStatsInputs>,
  species: Specie,
}

export function PokemonBigFormStats({ formHook, species }: Props) {
  const { register, watch } = formHook;
  const { gen, data } = useContext(GenContext);

  const ivs = watch("ivs");
  const evs = watch("evs");
  const level = watch("level");
  const nature = watch("nature");

  const stats = [...getStats(data, species, ivs, evs, level, (nature && gen >= 3 && data.natures.get(nature)) || undefined)]
    .sort((a, b) => STAT_ORDER.indexOf(a[0]) - STAT_ORDER.indexOf(b[0]))
    .map(([stat, value]) => {
      return {
        id: stat,
        name: gen === 1 && stat === "spa" ? "Spc" : Dex.stats.shortNames[stat],
        width: graphFunction(value),
        value,
      };
    });

  return (
    <div class="col-span-full bg-gray-100 p-1 rounded-xl gap-0.5">
      <div class="grid grid-rows-[max-content] auto-rows-fr grid-cols-[max-content_max-content_8fr_1fr_1fr] gap-0.5 rounded-lg overflow-hidden">
        <div class="col-span-full grid grid-cols-subgrid *:bg-type-steel-light">
          <p class="col-span-2 flex items-end justify-center py-0.5">Stats</p>
          <div class="text-center py-0.5 flex flex-col items-center">
            {gen >= 3 && (<>
              <label for="pokemon-nature" class="text-xs">Nature:</label>
              <select
                id="pokemon-nature"
                class="[text-align:inherit] bg-gray-100 rounded-md max-w-9/10 text-sm w-28 md:w-32 has-[[value='']:checked]:text-stone-400"
                {...register("nature")}
              >
                <option class="text-stone-400" value="">Unspecified</option>
                {[...data.natures].map((nature) => <option class="text-stone-900" value={nature.id}>{nature.name}</option>)}
              </select>
            </>)}
          </div>
          <p class="flex items-end justify-center py-0.5">EVs</p>
          <p class="flex items-end justify-center py-0.5">IVs</p>
        </div>
        { stats.map(({ id, name, width, value }) => (
          <div key={id} class="col-span-full grid grid-cols-subgrid">
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
              class="text-center flex justify-center items-center max-md:text-sm"
              style={{ backgroundColor: `var(--color-stat-${id}-light)` }}
            >
              <input
                class="[text-align:inherit] bg-gray-100 rounded-md mx-1"
                type="number"
                min={0}
                max={gen <= 2 ? 65535 : 255}
                placeholder={gen <= 2 ? "65535" : "0"}
                {...register(`evs.${id}`, {
                  min: { value: 0, message: `${name} EV can't be lower than 0` },
                  max: { value: 255, message: `${name} EV can't be higher than ${gen <= 2 ? 65535 : 255}` },
                  valueAsNumber: true,
                })}
              />
            </div>
            <div
              class="text-center flex justify-center items-center max-md:text-sm"
              style={{ backgroundColor: `var(--color-stat-${id}-light)` }}
            >
              <input
                class="[text-align:inherit] bg-gray-100 rounded-md mx-1"
                type="number"
                min={0}
                max={gen <= 2 ? 15 : 31}
                placeholder={gen <= 2 ? "15" : "31"}
                {...register(`ivs.${id}`, {
                  min: { value: 0, message: `${name} IV can't be lower than 0` },
                  max: { value: 31, message: `${name} IV can't be higher than ${gen <= 2 ? 15 : 31}` },
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
