import type { ComponentChildren } from "preact";
import type { UseFormReturn } from "react-hook-form";
import type { Specie } from "@pkmn/data";
import { useContext } from "preact/hooks";
import { GenContext } from "@/contexts/GenContext";
import { batched } from "@/utils/miscUtils";
import { Types } from "@/components/common/Types";
import { Combobox } from "@/components/common/Combobox";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export interface PokemonBigFormDataInputs {
  level?: number,

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
  formHook: UseFormReturn<PokemonBigFormDataInputs>,
  species: Specie,
}

export function PokemonBigFormData({ formHook, species }: Props) {
  const isMediumScreen = useMediaQuery("(width >= 48rem)");
  const { register } = formHook;
  const { gen, data } = useContext(GenContext);
  
  const dataItems: ComponentChildren[] = [];

  dataItems.push(<div class="flex flex-col gap-0.5">
    <p class="text-xs">Type:</p>
    <Types types={ species.types } />
  </div>);

  dataItems.push(<div class="flex flex-col gap-0.5">
    <label for="pokemon-level" class="text-xs">Level*:</label>
    <input
      id="pokemon-level"
      class="[text-align:inherit] bg-gray-100 rounded-md"
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
    />
  </div>);

  if (gen >= 3) dataItems.push(<div class="flex flex-col gap-0.5">
    <label for="pokemon-ability" class="text-xs">Ability:</label>
    <Combobox
      id="pokemon-ability"
      class="[text-align:inherit] bg-gray-100 rounded-md"
      placeholder={ species.abilities[0] }
      name="ability"
      formHook={ formHook }
      registerOpts={{
        validate: (v) => (v && (data.abilities.get(v)?.name !== v)) ? `Ability "${v}" not found` : true
      }}
      datalist={[...data.abilities].map((ability) => ability.name).filter((name) => !Object.values(species.abilities).includes(name))}
      defaultList={Object.values(species.abilities)}
    />
  </div>);

  if (gen >= 2) dataItems.push(
    (<div class="flex flex-col gap-0.5">
      <label for="pokemon-gender" class="text-xs">Gender*:</label>
      <select
        id="pokemon-gender"
        class="[text-align:inherit] bg-gray-100 rounded-md has-[[value='']:checked]:text-stone-400"
        {...register("gender", { required: "Gender must be selected" })}
      >
        <option disabled class="hidden" value="">Unspecified</option>
        {species.gender === "N" && <option class="text-stone-900" value="N">N/A</option>}
        {(!species.gender || species.gender === "M") && <option class="text-stone-900" value="M">Male</option>}
        {(!species.gender || species.gender === "F") && <option class="text-stone-900" value="F">Female</option>}
      </select>
    </div>),
    (<div class="flex flex-col gap-0.5">
      <label for="pokemon-item" class="text-xs">Held item:</label>
      <Combobox
        id="pokemon-item"
        class="[text-align:inherit] bg-gray-100 rounded-md"
        placeholder="No item"
        name="item"
        formHook={formHook}
        registerOpts={{
          validate: (v) => (v && (data.items.get(v)?.name !== v)) ? `Item "${v}" not found` : true
        }}
        datalist={[...data.items].map((item) => item.name)}
      />
    </div>),
    (<div class="flex flex-col gap-0.5">
      <label for="pokemon-shiny" class="text-xs">Is shiny?:</label>
      <select
        id="pokemon-shiny"
        class="[text-align:inherit] bg-gray-100 rounded-md"
        {...register("shiny", { setValueAs: (v) => v === "true" })}
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    </div>),
    (<div class="flex flex-col gap-0.5">
      <label for="pokemon-happiness" class="text-xs">Happiness:</label>
      <input
        id="pokemon-happiness"
        class="[text-align:inherit] bg-gray-100 rounded-md"
        type="number"
        placeholder="Unspecified"
        min={0}
        max={255}
        {...register("happiness", {
          min: { value: 0, message: "Happiness can't be lower than 0" },
          max: { value: 255, message: "Happiness can't be higher than 255" },
          valueAsNumber: true
        })}
      />
    </div>),
  );

  if (gen >= 3) dataItems.push(<div class="flex flex-col gap-0.5">
    <label for="pokemon-pokeball" class="text-xs">Pokéball:</label>
    <Combobox
      id="pokemon-pokeball"
      class="[text-align:inherit] bg-gray-100 rounded-md"
      placeholder="Unspecified"
      name="pokeball"
      formHook={formHook}
      registerOpts={{
        validate: (v) => (v && (!data.items.get(v)?.isPokeball || data.items.get(v)?.name !== v)) ? `Pokéball "${v}" not found` : true
      }}
      datalist={[...data.items].filter((item) => item.isPokeball).map((item) => item.name)}
    />
  </div>);

  if (gen >= 7) dataItems.push(<div class="flex flex-col gap-0.5">
    <label for="pokemon-hp-type" class="text-xs">Hidden Power type:</label>
    <select
      id="pokemon-hp-type"
      class="[text-align:inherit] bg-gray-100 rounded-md has-[[value='']:checked]:text-stone-400"
      {...register("hpType")}
    >
      <option class="text-stone-400" value="">Unspecified</option>
      {[...data.types]
        .filter((type) => !["stellar", "normal", "fairy"].includes(type.id))
        .map((type) => <option class="text-stone-900" value={type.id}>{type.name}</option>)}
    </select>
  </div>);

  if (gen === 8) dataItems.push(
    (<div class="flex flex-col gap-0.5">
      <label for="pokemon-dynamax-level" class="text-xs">Dynamax level:</label>
      <input
        id="pokemon-dynamax-level"
        class="[text-align:inherit] bg-gray-100 rounded-md"
        type="number"
        placeholder="Unspecified"
        min={0}
        max={10}
        {...register("dynamaxLevel", {
          min: { value: 0, message: "Dynamax level can't be lower than 0" },
          max: { value: 10, message: "Dynamax level can't be higher than 10" },
          valueAsNumber: true,
        })}
      />
    </div>),
    (<div class="flex flex-col gap-0.5">
      <label for="pokemon-gigantamax" class="text-xs">G-Max factor:</label>
      <select
        id="pokemon-gigantamax"
        class="[text-align:inherit] bg-gray-100 rounded-md"
        {...register("gigantamax", { setValueAs: (v) => v === "true" })}
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    </div>),
  )

  if (gen >= 9) dataItems.push(<div class="flex flex-col gap-0.5">
    <label for="pokemon-tera-type" class="text-xs">Tera type:</label>
    <select
      id="pokemon-tera-type"
      class="[text-align:inherit] bg-gray-100 rounded-md has-[[value='']:checked]:text-stone-400"
      {...register("teraType")}
    >
      <option class="text-stone-400" value="">Unspecified</option>
      {[...data.types].map((type) => <option class="text-stone-900" value={type.id}>{type.name}</option>)}
    </select>
  </div>);

  return (
    <div class="text-sm text-center col-span-full md:col-span-3
      grid grid-flow-col justify-evenly auto-cols-[minmax(0,50%)] md:auto-cols-[minmax(0,33%)] gap-1">
      {batched(dataItems, isMediumScreen.value ? 3 : 5)
        .map((items) => (<div class="flex flex-col justify-evenly gap-1">
          {items}
        </div>))}
    </div>
  );
}
