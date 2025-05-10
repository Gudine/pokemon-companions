import type { UseFormReturn } from "react-hook-form";
import type { GenderName } from "@pkmn/data";
import type { PokemonSet } from "@/utils/setUtils";
import type { ComponentChildren } from "preact";
import { useContext } from "preact/hooks";
import { GenContext } from "@/contexts/GenContext";
import { ImgUtils } from "@/utils/imgUtils";
import { MoveSmallForm, type MoveSmallFormInputs } from "@/components/move/MoveSmallForm";
import { PokemonBigFormStats, type PokemonBigFormStatsInputs } from "./PokemonBigFormStats";
import { PokemonBigFormData, type PokemonBigFormDataInputs } from "./PokemonBigFormData";
import { MoveInvalid } from "../move/MoveInvalid";

export interface PokemonBigFormInputs extends PokemonBigFormStatsInputs, PokemonBigFormDataInputs, MoveSmallFormInputs {
  name?: string,
}

type Props = {
  formHook: UseFormReturn<PokemonBigFormInputs>
  buttons?: ComponentChildren,
} & ({
  speciesName: string,
  base?: never,
} | {
  speciesName?: never,
  base: PokemonSet,
});

export function PokemonBigForm({
  formHook, speciesName, base, buttons,
}: Props) {
  const { register, watch } = formHook;
  const { gen, data } = useContext(GenContext);

  const species = base ? base.data.species : data.species.get(speciesName)!;
  const shiny = watch("shiny");
  const gender = watch("gender");
  const moves = watch("move");
  let validMoves = 0;

  if (moves) for (const move of moves) {
    if (!move || (data.moves.get(move)?.name !== move)) break;
    validMoves += 1;
  }

  const image = ImgUtils.getPokemon(
    species.name,
    gen >= 2 && shiny,
    (gen >= 2 && gender as GenderName) || undefined,
  );

  return (
    <div
      class="grid grid-cols-2 grid-rows-[repeat(4,max-content)] content-between gap-1
        rounded-xl p-1 w-80
        md:grid-cols-4 md:grid-rows-[repeat(3,max-content)] md:w-170
        border-4 border-type-unknown-dark bg-type-unknown-light
        **:placeholder:text-stone-400"
      style={{
        backgroundColor: `var(--color-type-${species.types[0].toLowerCase()}-light)`,
        borderColor: `var(--color-type-${(species.types[1] ?? species.types[0]).toLowerCase()}-dark)`,
      }}
    >
      <div class="col-span-full md:col-span-1 grid grid-cols-1 grid-rows-1 *:col-start-1 *:row-start-1">
        <div class="flex flex-col items-center justify-evenly gap-0.5">
          <span
            role="img"
            aria-label={ `${gen >= 2 && shiny ? "Shiny " : ""}${species.name}` }
            title={ `${gen >= 2 && shiny ? "Shiny " : ""}${species.name}` }
            style={ image.css }
            class="rounded-xl bg-gray-100"
          />

          <input
            class="bg-gray-100 rounded-md w-9/10 px-1 py-0.5 text-center text-sm"
            type="text"
            placeholder={species.name}
            {...register("name")}
          />
        </div>
        { buttons && <div
          class="flex flex-col gap-2 justify-self-start text-type-unknown-dark"
          style={ { color: `var(--color-type-${species.types[0].toLowerCase()}-dark)` } }
        >
          { buttons }
        </div> }
      </div>

      <PokemonBigFormData
        formHook={formHook}
        species={ species }
      />

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 items-end
        col-span-full bg-gray-100 rounded-xl p-1">
          {([0, 1, 2, 3] as const).map((i) => (validMoves < i) ? <MoveInvalid /> : (
            <MoveSmallForm
              key={`move${i}`}
              index={i}
              formHook={formHook}
            />
          ))}
      </div>

      <PokemonBigFormStats
        species={ species }
        formHook={formHook}
      />
    </div>
  )
}
