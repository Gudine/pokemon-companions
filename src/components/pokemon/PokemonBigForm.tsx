import type { UseFormReturn } from "react-hook-form";
import type { GenderName } from "@pkmn/data";
import { useContext } from "preact/hooks";
import { GenContext } from "@/contexts/GenContext";
import { ImgUtils } from "@/utils/imgUtils";
import { MoveSmallForm, type MoveSmallFormInputs } from "@/components/move/MoveSmallForm";
import { PokemonBigFormStats, type PokemonBigFormStatsInputs } from "./PokemonBigFormStats";
import { PokemonBigFormData, type PokemonBigFormDataInputs } from "./PokemonBigFormData";

export interface PokemonBigFormInputs extends PokemonBigFormStatsInputs, PokemonBigFormDataInputs, MoveSmallFormInputs {
  name?: string,
}

interface Props {
  formHook: UseFormReturn<PokemonBigFormInputs>,
  speciesName: string,
  grouping?: string,
}

export function PokemonBigForm({ formHook, speciesName, grouping }: Props) {
  const { register, watch } = formHook;
  const { gen, data } = useContext(GenContext);

  const species = data.species.get(speciesName)!;
  const shiny = watch("shiny");
  const gender = watch("gender");

  const image = ImgUtils.getPokemon(
    species.name,
    gen >= 2 && shiny,
    (gen >= 2 && gender as GenderName) || undefined,
  );

  return (
    <div
      class="grid grid-cols-4 grid-rows-[repeat(3,max-content)] content-between gap-1
        rounded-xl p-1 w-170
        border-4 border-type-unknown-dark bg-type-unknown-light
        **:placeholder:text-stone-400"
      style={{
        backgroundColor: `var(--color-type-${species.types[0].toLowerCase()}-light)`,
        borderColor: `var(--color-type-${(species.types[1] ?? species.types[0]).toLowerCase()}-dark)`,
      }}
    >
      <div class="flex flex-col items-center justify-evenly gap-0.5">
        <span
          role="img"
          aria-label={ `${gen >= 2 && shiny ? "Shiny " : ""}${species.name}` }
          title={ `${gen >= 2 && shiny ? "Shiny " : ""}${species.name}` }
          style={ image.css }
          class="rounded-xl bg-gray-100"
        />

        <input
          class="bg-gray-100 rounded-md w-9/10
            pb-0.5 pt-0.5 pl-1 pr-1
            text-center text-sm"
          type="text"
          placeholder={species.name}
          {...register("name")}
        />
      </div>

      <PokemonBigFormData
        formHook={formHook}
        speciesName={ speciesName }
        grouping={ grouping }
      />

      <div class="grid grid-cols-4 gap-2 items-end
        row-start-2 col-span-full bg-gray-100 rounded-xl p-1">
          {Array<void>(4).fill().map((_v, i) => (
            <MoveSmallForm
              key={`move${i}`}
              index={i as 0 | 1 | 2 | 3}
              formHook={formHook}
            />
          ))}
      </div>

      <PokemonBigFormStats
        speciesName={ speciesName }
        formHook={formHook}
      />
    </div>
  )
}
