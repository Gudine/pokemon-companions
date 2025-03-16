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

interface Props {
  close: () => void;
  playthrough?: number;
}

interface Inputs {
  playthrough: number,
  data: string,
}

export function ImportPokemonModal({ close, playthrough: defaultPlaythrough }: Props) {
  const playthroughs = useDBResource(
    Playthrough.getAll,
    "playthrough",
    {},
  );

  const { register, handleSubmit, setError, watch, formState: { isSubmitting, errors, isValid } } = useForm<Inputs>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      playthrough: defaultPlaythrough,
    },
  });
  
  const pkmn = useSignal<PokemonSet>();
  
  const generation = playthroughs.find((p) => p.id === watch("playthrough"))?.gen;

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

      if (err instanceof SetValidationError) {
        return err.message;
      } else {
        throw err;
      }
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ playthrough }) => {
    try {
      await PokemonUnit.add(
        pkmn.value!,
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
      grid grid-cols-2 grid-rows-[max-content_max-content_1fr_max-content] gap-2"
    >
      <p class="text-xl font-bold text-center col-span-2">Add new Pokémon</p>

      <label class="row-span-3 flex flex-col">
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
      
      <fieldset disabled={ isSubmitting || defaultPlaythrough !== undefined }>
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
