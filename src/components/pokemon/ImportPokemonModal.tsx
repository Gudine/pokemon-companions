import { useSignal } from "@preact/signals";
import { AiOutlineLoading } from "react-icons/ai";
import { useForm, type SubmitHandler, type Validate } from "react-hook-form";
import { GenProvider } from "@/contexts/GenContext";
import { Playthrough } from "@/db/Playthrough";
import { PokemonUnit } from "@/db/PokemonUnit";
import { SetValidationError } from "@/errors";
import { useDBResource } from "@/hooks/useDBResource";
import { importSetWithErrors, type PokemonSet } from "@/utils/setUtils";
import { Button } from "@/components/common/Button";
import { SpeciesPokemonSmall } from "./SpeciesPokemonSmall";
import { tracePokemon } from "@/utils/pkmnUtils";
import type { SpeciesName } from "@pkmn/data";

interface Props {
  close: () => void;
  playthrough?: number;
}

interface Inputs {
  playthrough: number,
  grouping: string,
  data: string,
}

export function ImportPokemonModal({ close, playthrough: defaultPlaythrough }: Props) {
  const playthroughs = useDBResource(
    Playthrough.getAll,
    "playthrough",
    {},
  );

  const { register, handleSubmit, setValue, setError, clearErrors, watch, formState: { isSubmitting, errors, isValid } } = useForm<Inputs>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      playthrough: defaultPlaythrough,
      grouping: "",
    },
  });
  
  const pkmn = useSignal<PokemonSet>();
  
  const generation = playthroughs.find((p) => p.id === watch("playthrough"))?.gen;

  const groupings = pkmn.value && tracePokemon(pkmn.value.data.species.name, pkmn.value.data.main).map((grouping) => grouping[1]);

  const validateData: Validate<string, Inputs> = (value) => {
    if (!value) {
      pkmn.value = undefined;
      return false;
    }

    try {
      pkmn.value = importSetWithErrors(
        value,
        generation ?? 9,
      );
      return true;
    } catch (err) {
      pkmn.value = undefined;
      setValue("grouping", "");
      clearErrors("grouping");

      if (err instanceof SetValidationError) {
        return err.message;
      } else {
        throw err;
      }
    }
  };

  const validateGrouping: Validate<string | undefined, Inputs> = (value) => {
    if (!pkmn.value || !value) return false;
    const species = pkmn.value.data.main.species.get(value);

    if (!species) return false;

    if (!pkmn.value.isGen(2)) return true;

    if (species.gender === "N" && pkmn.value.gender) {
      return `Gender cannot be specified for species ${species.name}`;
    }

    if (species.gender === "M" && pkmn.value.gender !== "M") {
      return `Gender must be male for species ${species.name}`;
    }

    if (species.gender === "F" && pkmn.value.gender !== "F") {
      return `Gender must be female for species ${species.name}`;
    }

    if (!pkmn.value.gender) {
      return `Gender must be specified for species ${species.name}`;
    }
    
    return true;
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ playthrough, grouping }) => {
    try {
      const [species, form] = tracePokemon(
        (grouping as SpeciesName | undefined) || groupings![0],
        pkmn.value!.data.main,
      )[0];
      
      await PokemonUnit.add(
        pkmn.value!,
        species,
        form,
        playthrough,
      );
      close();
    } catch (err) {
      if (err instanceof Error && err.message.match(/^Species .+? not found$/)) {
        setError("data", {
          type: "database",
          message: err.message,
        });
      }
    }
  }

  return (
    <form
      onSubmit={ handleSubmit(onSubmit) }
      class="w-full h-full
      grid grid-cols-2 grid-rows-[max-content_max-content_max-content_1fr_max-content] gap-2"
    >
      <p class="text-xl font-bold text-center col-span-2">Add new Pokémon</p>

      <label class="row-span-4 flex flex-col">
        Data:
        <textarea
          class="bg-gray-100 border-2 border-stone-500 rounded-lg
            pt-1 pb-1 pl-2 pr-2
          disabled:bg-gray-300 text-stone-700
            grow"
          spellcheck={ false }
          disabled={ isSubmitting }
          {...register("data", {
            required: "Pokémon data must be set",
            validate: validateData,
          })}
        />
        <p class="text-sm text-red-500 empty:before:inline-block">
          {errors.data?.message ?? ""}
        </p>
      </label>
      
      <fieldset
        class={(!groupings || groupings.length <= 1) ? "row-span-2" : ""}
        disabled={ isSubmitting || defaultPlaythrough !== undefined }
      >
        <label class="flex flex-col">
          Playthrough:
          <select
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
          <p class="text-sm text-red-500 empty:before:inline-block">
            {errors.playthrough?.message ?? ""}
          </p>
        </label>
      </fieldset>
      

      {groupings && groupings.length > 1 && (<label class="flex flex-col grow">
        Grouping*:
        <select
          disabled={ isSubmitting }
          class="bg-gray-100 border-2 border-stone-500 rounded-lg
            pt-1 pb-1 pl-2 pr-2
          disabled:bg-gray-300 text-stone-700
          invalid:text-stone-500 *:text-stone-700"
          {...register("grouping", {
            required: "Grouping must be selected",
            validate: validateGrouping,
            deps: ["data"],
          })}
        >
          <option disabled class="hidden" value="">
            -- Select Grouping --
          </option>
          {groupings.map((grouping) => <option value={grouping}>{grouping}</option>)}
        </select>
        <p class="text-sm text-red-500 empty:before:inline-block">
          {errors.grouping?.message ?? ""}
        </p>
      </label>)}
      
      <div class="flex flex-col">
        <p>Preview:</p>
        <GenProvider gen={ generation }>
          {pkmn.value && (<div class="self-center w-max">
            <SpeciesPokemonSmall pkmn={ pkmn.value }/>
          </div>)}
        </GenProvider>
      </div>

      <Button class="justify-self-end" type="submit" disabled={!(isValid || isSubmitting)}>
        { !isSubmitting
          ? "Submit"
          /* @ts-expect-error */
          : <AiOutlineLoading className="animate-spin" /> }
      </Button>
    </form>
  )
}
