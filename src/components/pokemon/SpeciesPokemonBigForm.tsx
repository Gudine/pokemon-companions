import type { ComponentChildren } from "preact";
import type { UseFormReturn } from "react-hook-form";
import type { GenderName } from "@pkmn/data";
import { useContext } from "preact/hooks";
import { GenContext } from "@/contexts/GenContext";
import { ImgUtils } from "@/utils/imgUtils";
import { batched } from "@/utils/miscUtils";
import { Types } from "@/components/common/Types";
import { Combobox } from "@/components/common/Combobox";
import { MoveSmallForm, type MoveSmallFormInputs } from "@/components/move/MoveSmallForm";
import { SpeciesPokemonBigFormStats, type SpeciesPokemonBigFormStatsInputs } from "./SpeciesPokemonBigFormStats";

export interface SpeciesPokemonBigFormInputs extends SpeciesPokemonBigFormStatsInputs, MoveSmallFormInputs {
  name?: string,
  happiness?: number,
  ability?: string,
  gender?: string,
  item?: string,
  shiny?: boolean,
  pokeball?: string,
  hpType?: string,
  dynamaxLevel?: number,
  gigantamax?: boolean,
  teraType?: string,
}

interface Props {
  formHook: UseFormReturn<SpeciesPokemonBigFormInputs>,
  speciesName: string,
}

export function SpeciesPokemonBigForm({ formHook, speciesName }: Props) {
  const { register, watch, setValue } = formHook;
  const { gen, data } = useContext(GenContext);

  const species = data.species.get(speciesName)!;
  const shiny = watch("shiny");
  const gender = watch("gender");

  const image = ImgUtils.getPokemon(
    species.name,
    gen >= 2 && shiny,
    (gen >= 2 && gender as GenderName) || undefined,
  );
  
  const dataItems: [string, string, ComponentChildren][] = [];

  dataItems.push(["type", "Type", <Types types={ species.types } />]);
  dataItems.push(["pokemon-level", "Level*", (<input
    id="pokemon-level"
    class="[text-align:inherit] bg-gray-100 rounded-md pl-4"
    type="number"
    placeholder="Unspecified"
    min={1}
    max={100}
    {...register("level", {
      required: "Level must be specified",
      min: { value: 1, message: "Level can't be lower than 1" },
      max: { value: 100, message: "Level can't be higher than 100" },
      valueAsNumber: true,
    })}
  />)]);

  if (gen >= 3) dataItems.push(["pokemon-ability", "Ability", (<Combobox
    id="pokemon-ability"
    class="[text-align:inherit] bg-gray-100 rounded-md"
    placeholder={ species.abilities[0] }
    register={register("ability", {
      validate: (v) => (v && (data.abilities.get(v)?.name !== v)) ? `Ability "${v}" not found` : true
    })}
    watch={() => watch("ability") || ""}
    setValue={(v) => { setValue("ability", v, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    }) }}
    datalist={[...data.abilities].map((ability) => ability.name).filter((name) => !Object.values(species.abilities).includes(name))}
    defaultList={Object.values(species.abilities)}
  />)]);

  if (gen >= 2) dataItems.push(
    ["pokemon-gender", "Gender*", (<select
      id="pokemon-gender"
      class="[text-align:inherit] bg-gray-100 rounded-md has-[[value='']:checked]:text-stone-400"
      {...register("gender", { required: "Gender must be selected" })}
    >
      <option disabled class="hidden" value="">Unspecified</option>
      {species.gender === "N" && <option class="text-stone-900" value="N">N/A</option>}
      {(!species.gender || species.gender === "M") && <option class="text-stone-900" value="M">Male</option>}
      {(!species.gender || species.gender === "F") && <option class="text-stone-900" value="F">Female</option>}
    </select>)],
    ["pokemon-item", "Held item", (<Combobox
      id="pokemon-item"
      class="[text-align:inherit] bg-gray-100 rounded-md"
      placeholder="Unspecified"
      register={register("item", {
        validate: (v) => (v && (data.items.get(v)?.name !== v)) ? `Item "${v}" not found` : true
      })}
      watch={() => watch("item") || ""}
      setValue={(v) => { setValue("item", v, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }) }}
      datalist={[...data.items].map((item) => item.name)}
    />)],
    ["pokemon-shiny", "Is shiny?", (<select
      id="pokemon-shiny"
      class="[text-align:inherit] bg-gray-100 rounded-md"
      {...register("shiny", { setValueAs: (v) => v === "true" })}
    >
      <option value="true">True</option>
      <option value="false">False</option>
    </select>)],
    ["pokemon-happiness", "Happiness", (<input
      id="pokemon-happiness"
      class="[text-align:inherit] bg-gray-100 rounded-md pl-4"
      type="number"
      placeholder="Unspecified"
      min={0}
      max={255}
      {...register("happiness", {
        min: { value: 0, message: "Happiness can't be lower than 0" },
        max: { value: 255, message: "Happiness can't be higher than 255" },
        valueAsNumber: true
      })}
    />)]
  );

  if (gen >= 3) dataItems.push(["pokemon-pokeball", "Pokéball", (<Combobox
    id="pokemon-pokeball"
    class="[text-align:inherit] bg-gray-100 rounded-md"
    placeholder="Unspecified"
    register={register("pokeball", {
      validate: (v) => (v && (!data.items.get(v)?.isPokeball || data.items.get(v)?.name !== v)) ? `Pokéball "${v}" not found` : true
    })}
    watch={() => watch("pokeball") || ""}
    setValue={(v) => { setValue("pokeball", v, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    }) }}
    datalist={[...data.items].filter((item) => item.isPokeball).map((item) => item.name)}
  />)]);

  if (gen >= 7) dataItems.push(["pokemon-hp-type", "Hidden Power type", (<select
    id="pokemon-hp-type"
    class="[text-align:inherit] bg-gray-100 rounded-md has-[[value='']:checked]:text-stone-400"
    {...register("hpType")}
  >
    <option class="text-stone-400" value="">Unspecified</option>
    {[...data.types]
      .filter((type) => !["stellar", "normal", "fairy"].includes(type.id))
      .map((type) => <option class="text-stone-900" value={type.id}>{type.name}</option>)}
  </select>)]);

  if (gen === 8) dataItems.push(
    ["pokemon-dynamax-level", "Dynamax level", (<input
      id="pokemon-dynamax-level"
      class="[text-align:inherit] bg-gray-100 rounded-md pl-4"
      type="number"
      placeholder="Unspecified"
      min={0}
      max={10}
      {...register("dynamaxLevel", {
        min: { value: 0, message: "Dynamax level can't be lower than 0" },
        max: { value: 10, message: "Dynamax level can't be higher than 10" },
        valueAsNumber: true,
      })}
    />)],
    ["pokemon-gigantamax", "G-Max factor", (<select
      id="pokemon-gigantamax"
      class="[text-align:inherit] bg-gray-100 rounded-md"
      {...register("gigantamax", { setValueAs: (v) => v === "true" })}
    >
      <option value="true">True</option>
      <option value="false">False</option>
    </select>)],
  );

  if (gen >= 9) dataItems.push(["pokemon-tera-type", "Tera type", (<select
    id="pokemon-tera-type"
    class="[text-align:inherit] bg-gray-100 rounded-md has-[[value='']:checked]:text-stone-400"
    {...register("teraType")}
  >
    <option class="text-stone-400" value="">Unspecified</option>
    {[...data.types].map((type) => <option class="text-stone-900" value={type.id}>{type.name}</option>)}
  </select>)]);

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
        <img
          src={ image.url }
          width={ image.w }
          height={ image.h }
          title={ `${gen >= 2 && shiny ? "Shiny " : ""}${species.name}` }
          alt={ `${gen >= 2 && shiny ? "Shiny " : ""}${species.name}` }
          style={ { imageRendering: image.pixelated ? "pixelated" : "auto" } }
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
      <div class="text-sm text-center col-span-3
        grid grid-flow-col justify-evenly auto-cols-[minmax(0,33%)] gap-1">
        {batched(dataItems, 3).map((items) => (<div class="flex flex-col justify-evenly gap-1">
          {items.map(([id, dtValue, ddValue]) => (<div class={`flex flex-col gap-0.5`}>
            {id === "type" ? <p class="text-xs">{dtValue}:</p> : <label for={id} class="text-xs">{dtValue}:</label>}
            {ddValue}
          </div>))}
        </div>))}
      </div>

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

      <SpeciesPokemonBigFormStats
        speciesName={ speciesName }
        formHook={formHook}
      />
    </div>
  )
}
