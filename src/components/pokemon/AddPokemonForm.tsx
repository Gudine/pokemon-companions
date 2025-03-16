import type { SpeciesName } from "@pkmn/data";
import type { MinimalSet } from "@/utils/setUtils/sets";
import { useEffect, useMemo } from "preact/hooks";
import { AiOutlineLoading } from "react-icons/ai";
import { FormProvider, useForm, type DefaultValues, type SubmitHandler, type UseFormReturn, type Validate } from "react-hook-form";
import { GenProvider } from "@/contexts/GenContext";
import { gens } from "@/data";
import { Playthrough } from "@/db/Playthrough";
import { PokemonUnit } from "@/db/PokemonUnit";
import { DatabaseError, SetValidationError } from "@/errors";
import { storedFormData } from "@/globalState";
import { importFromObject } from "@/utils/setUtils";
import { tracePokemon } from "@/utils/pkmnUtils";
import { useDBResource } from "@/hooks/useDBResource";
import { Button } from "@/components/common/Button";
import { Combobox } from "@/components/common/Combobox";
import { SpeciesPokemonBigForm, type SpeciesPokemonBigFormInputs } from "./SpeciesPokemonBigForm";

export interface PokemonFormInputs extends SpeciesPokemonBigFormInputs {
  playthrough: number,
  species: string,
}

function findMessage(obj: any): string | undefined {
  for (const entry of Object.values<any>(obj)) {
    if (entry.message) return entry.message;
    
    if (typeof entry === "object") {
      const found = findMessage(entry);
      if (found) return found;
    }
  }
}

function getValuesFromStore(): DefaultValues<PokemonFormInputs> {
  return {
    playthrough: storedFormData.value.playthrough !== undefined && !isNaN(storedFormData.value.playthrough!)
      ? storedFormData.value.playthrough
      : "" as unknown as number,
    species: storedFormData.value.species ?? "",
    
    name: storedFormData.value.name,
    happiness: storedFormData.value.happiness,
    ability: storedFormData.value.ability,
    gender: storedFormData.value.gender ?? "",
    item: storedFormData.value.item,
    shiny: storedFormData.value.shiny ?? false,
    pokeball: storedFormData.value.pokeball,
    hpType: storedFormData.value.hpType ?? "",
    dynamaxLevel: storedFormData.value.dynamaxLevel,
    gigantamax: storedFormData.value.gigantamax ?? false,
    teraType: storedFormData.value.teraType ?? "",

    level: storedFormData.value.level,
    nature: storedFormData.value.nature ?? "",

    ivs: {
      hp: storedFormData.value.ivs?.hp,
      atk: storedFormData.value.ivs?.atk,
      def: storedFormData.value.ivs?.def,
      spa: storedFormData.value.ivs?.spa,
      spd: storedFormData.value.ivs?.spd,
      spe: storedFormData.value.ivs?.spe,
    },
    evs: {
      hp: storedFormData.value.evs?.hp,
      atk: storedFormData.value.evs?.atk,
      def: storedFormData.value.evs?.def,
      spa: storedFormData.value.evs?.spa,
      spd: storedFormData.value.evs?.spd,
      spe: storedFormData.value.evs?.spe,
    },

    move: [
      storedFormData.value.move?.[0],
      storedFormData.value.move?.[1],
      storedFormData.value.move?.[2],
      storedFormData.value.move?.[3],
    ],
  };
}

export function AddPokemonForm() {
  const playthroughs = useDBResource(
    Playthrough.getAll,
    "playthrough",
    {},
  );

  const formHook = useForm<PokemonFormInputs>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: getValuesFromStore(),
  });

  const {
    register, handleSubmit, setValue, setError,
    watch, getValues, reset, trigger,
    formState: { isSubmitting, errors, isValid },
  } = formHook;
  
  const generation = playthroughs.find((p) => p.id === watch("playthrough"))?.gen;
  const data = gens.get(generation ?? 9);

  const speciesList = useMemo(() => [...data.species].filter((species) => tracePokemon(species.name)), [data]);

  const speciesName = watch("species");

  const saveToStore = () => {
    const values = getValues();

    storedFormData.value = {
      playthrough: values.playthrough,
      species: values.species,
      
      name: values.name,
      happiness: values.happiness,
      ability: values.ability,
      gender: values.gender,
      item: values.item,
      shiny: values.shiny,
      pokeball: values.pokeball,
      hpType: values.hpType,
      dynamaxLevel: values.dynamaxLevel,
      gigantamax: values.gigantamax,
      teraType: values.teraType,

      level: values.level,
      nature: values.nature,

      ivs: {
        hp: values?.ivs?.hp,
        atk: values?.ivs?.atk,
        def: values?.ivs?.def,
        spa: values?.ivs?.spa,
        spd: values?.ivs?.spd,
        spe: values?.ivs?.spe,
      },
      evs: {
        hp: values?.evs?.hp,
        atk: values?.evs?.atk,
        def: values?.evs?.def,
        spa: values?.evs?.spa,
        spd: values?.evs?.spd,
        spe: values?.evs?.spe,
      },

      move: [
        values?.move?.[0],
        values?.move?.[1],
        values?.move?.[2],
        values?.move?.[3],
      ],
    }
  };

  useEffect(() => {
    return saveToStore;
  }, [formHook]);

  useEffect(() => {
    const [move, ability, item, pokeball] = getValues(["move", "ability", "item", "pokeball"]);

    if (ability) trigger("ability");
    if (item) trigger("item");
    if (pokeball) trigger("pokeball");
    
    if (move?.[0]) trigger("move.0");
    if (move?.[1]) trigger("move.1");
    if (move?.[2]) trigger("move.2");
    if (move?.[3]) trigger("move.3");
  }, [generation]);
  
  const validateData = ((value, formValues?) => {
    if (!value || !tracePokemon(value as SpeciesName) || data.species.get(value as SpeciesName)?.name !== value) {
      return false;
    }

    const species = data.species.get(value as SpeciesName)!;

    if (formValues?.gender && (species.gender ? formValues.gender !== species.gender : !["M", "F"].includes(formValues.gender))) {
      setValue("gender", "");
    }

    return true;
  }) satisfies Validate<string, PokemonFormInputs>;

  const onSubmit: SubmitHandler<PokemonFormInputs> = async (values) => {
    const minimal: MinimalSet = {
      name: values.name || undefined,
      species: values.species,
      item: values.item || undefined,
      ability: values.ability || undefined,
      nature: values.nature || undefined,
      gender: values.gender || undefined,
      level: !isNaN(values.level!) && values.level || undefined,
      shiny: values.shiny || undefined,
      happiness: !isNaN(values.happiness!) && values.happiness || undefined,
      pokeball: values.pokeball || undefined,
      hpType: values.hpType || undefined,
      dynamaxLevel: !isNaN(values.dynamaxLevel!) && values.dynamaxLevel || undefined,
      gigantamax: values.gigantamax || undefined,
      teraType: values.teraType || undefined,
      
      evs: {
        hp: !isNaN(values.evs?.hp!) && values.evs?.hp || undefined,
        atk: !isNaN(values.evs?.atk!) && values.evs?.atk || undefined,
        def: !isNaN(values.evs?.def!) && values.evs?.def || undefined,
        spa: !isNaN(values.evs?.spa!) && values.evs?.spa || undefined,
        spd: !isNaN(values.evs?.spd!) && values.evs?.spd || undefined,
        spe: !isNaN(values.evs?.spe!) && values.evs?.spe || undefined,
      },
      ivs: {
        hp: !isNaN(values.ivs?.hp!) && values.ivs?.hp || undefined,
        atk: !isNaN(values.ivs?.atk!) && values.ivs?.atk || undefined,
        def: !isNaN(values.ivs?.def!) && values.ivs?.def || undefined,
        spa: !isNaN(values.ivs?.spa!) && values.ivs?.spa || undefined,
        spd: !isNaN(values.ivs?.spd!) && values.ivs?.spd || undefined,
        spe: !isNaN(values.ivs?.spe!) && values.ivs?.spe || undefined,
      },

      moves: values.move?.filter((move) => move !== undefined).filter((move) => move),
    };
    
    try {
      const pkmn = importFromObject(minimal, generation ?? 9);
      
      await PokemonUnit.add(
        pkmn,
        values.playthrough,
      );

      storedFormData.value = {};
      reset(getValuesFromStore());
    } catch (err) {
      if (err instanceof SetValidationError) {
        setError("species", {
          type: "setValidation",
          message: err.message,
        });
      } else if (err instanceof DatabaseError) {
        setError("species", {
          type: "database",
          message: err.message,
        });
      }
    }
  }

  return (
    <form
      onSubmit={ handleSubmit(onSubmit) }
      class="w-full h-full flex flex-col gap-2"
    >
      <p class="text-xl font-bold text-center col-span-2">Add new Pokémon</p>
      <fieldset
        class="grid grid-cols-[1fr_1fr] grid-rows-[max-content_max-content_1fr] gap-2"
        disabled={ isSubmitting }
      >
        <div class="flex flex-col">
          <label for="pokemon-species">Species:</label>
          <Combobox
            id="pokemon-species"
            class="flex flex-col relative
              bg-gray-100 border-2 border-stone-500 rounded-lg text-stone-700
              pt-1 pb-1 pl-2 pr-2"
            register={register("species", {
              required: true,
              validate: validateData,
            })}
            watch={() => watch("species")}
            setValue={(v) => { setValue("species", v, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            }) }}
            datalist={speciesList.map((species) => species.name)}
          />
        </div>

        <label class="flex flex-col">
          Playthrough:
          <select
            disabled={ isSubmitting }
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              pt-1 pb-1 pl-2 pr-2
            disabled:bg-gray-300 text-stone-700
            invalid:text-stone-500 *:text-stone-700"
            {...register("playthrough", { required: "Playthrough must be selected", valueAsNumber: true })}
          >
            <option disabled class="hidden" value="">
              -- Select Playthrough --
            </option>
            {playthroughs.map((currPlaythrough) => <option value={currPlaythrough.id}>{currPlaythrough.name}</option>)}
          </select>
        </label>

        <p class="text-sm text-center text-red-500 col-span-2 empty:before:inline-block">
          {findMessage(errors)}
        </p>
        
        <div class="flex justify-center items-center col-span-2">
          <GenProvider gen={ generation }>
            <FormProvider {...formHook}>
              { validateData(speciesName) && (<SpeciesPokemonBigForm
                speciesName={ speciesName }
                formHook={ formHook as UseFormReturn<PokemonFormInputs | SpeciesPokemonBigFormInputs> }
              />) }
            </FormProvider>
          </GenProvider>
        </div>
      </fieldset>

      <Button class="justify-self-end" type="submit" disabled={!(isValid || isSubmitting)}>
        { !isSubmitting
          ? "Submit"
          /* @ts-expect-error */
          : <AiOutlineLoading className="animate-spin" /> }
      </Button>
    </form>
  )
}
