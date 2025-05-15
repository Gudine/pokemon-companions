import type { StatID } from "@pkmn/data";
import { useEffect, type TargetedEvent } from "preact/compat";
import { useSignal } from "@preact/signals";
import toast from "react-hot-toast";
import { AiOutlineLoading } from "react-icons/ai";
import { useForm, type SubmitHandler, type Validate } from "react-hook-form";
import { GenProvider } from "@/contexts/GenContext";
import { Playthrough } from "@/db/Playthrough";
import { PokemonUnit } from "@/db/PokemonUnit";
import { SetValidationError } from "@/errors";
import { useDBResource } from "@/hooks/useDBResource";
import { type PokemonSet, importFromObject } from "@/utils/setUtils";
import { Teams } from "@/utils/setUtils/teams";
import { tracePokemon } from "@/utils/pkmnUtils";
import { showPlaythroughEditor } from "@/components/playthrough/showPlaythroughEditor";
import { Button } from "@/components/common/Button";
import { PokemonSmall } from "../PokemonSmall";

interface Inputs {
  playthrough: number,
  data: string,
}

export function ImportPokemonForm() {
  const playthroughs = useDBResource(
    Playthrough.getAll,
    "playthrough",
    {},
    false,
  );

  const { register, handleSubmit, setError, watch, reset, setValue, formState: { isSubmitting, errors, isValid } } = useForm<Inputs>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      playthrough: "" as unknown as number,
    },
  });
  
  const pendingPlaythrough = useSignal<number>();

  useEffect(() => {
    const pending = pendingPlaythrough.value;
    if (pending !== undefined) setValue("playthrough", pending);
  }, [playthroughs]);
  
  const pkmnList = useSignal<PokemonSet[]>([]);
  
  const generation = playthroughs.find((p) => p.id === watch("playthrough"))?.gen;

  const validateData: Validate<string, Inputs> = (value) => {
    if (!value.trim()) {
      pkmnList.value = [];
      return false;
    }

    try {
      const gen = generation ?? 9;

      pkmnList.value = Teams.importTeams(value)
        .flatMap((team) => team.team)
        .map((set) => {
          if (gen <= 2) {
            if (set.ivs && Object.values(set.ivs).some((v) => v > 15)) {
              for (const key in set.ivs) {
                set.ivs[key as StatID] = Math.floor(set.ivs[key as StatID]! / 2);
              }
            }

            if (set.evs && !Object.values(set.evs).some((v) => v > 255)) {
              for (const key in set.evs) {
                set.evs[key as StatID] = set.evs[key as StatID]! ** 2;
              }
            }
          }
          
          return importFromObject(set, gen);
        });
      return true;
    } catch (err) {
      pkmnList.value = [];

      if (err instanceof SetValidationError) {
        return err.message;
      } else {
        throw err;
      }
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ playthrough }) => {
    try {
      await Promise.all(pkmnList.value.map((pkmn) => {
        const groupings = tracePokemon(pkmn.data.species.name, pkmn.data.main);
  
        const [species, form] = groupings.length === 1 ? groupings[0] : ["", ""] as const;
      
        return PokemonUnit.add(
          pkmn,
          species,
          form,
          playthrough,
        );
      }))

      if (pkmnList.value.length === 1) {
        const pkmn = pkmnList.value[0];
        toast.success(`${pkmn.name || pkmn.data.species.name} added successfully`);
      } else {
        toast.success(`Pokémon added successfully`);
      }
      
      pkmnList.value = [];
      reset();
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
      class="p-4 w-full h-full flex flex-col gap-2"
    >
      <fieldset disabled={ isSubmitting }>
        <label class="flex flex-col">
          Playthrough*:
          <select
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              px-2 py-1
            disabled:bg-gray-300 text-stone-700
            invalid:text-stone-500 *:text-stone-700"
            {...register("playthrough", {
              required: "Playthrough must be selected",
              valueAsNumber: true,
              deps: ["data"],
              onChange: async (ev: TargetedEvent<HTMLSelectElement>) => {
                if (ev.currentTarget.value === "-1") {
                  setValue("playthrough", "" as unknown as number);
                  const id = await showPlaythroughEditor.call({});
                  if (id) pendingPlaythrough.value = id;
                }
              },
            })}
          >
            <option disabled class="hidden" value="">
              -- Select Playthrough --
            </option>
            {playthroughs.map((currPlaythrough) => <option value={currPlaythrough.id}>{currPlaythrough.name}</option>)}
            <option value="-1">
              -- New Playthrough --
            </option>
          </select>
          <p class="text-sm text-red-500 empty:before:inline-block">
            {errors.playthrough?.message ?? ""}
          </p>
        </label>
      </fieldset>

      <label class="flex flex-col">
        Data*:
        <textarea
          class="bg-gray-100 border-2 border-stone-500 rounded-lg
            px-2 py-1
          disabled:bg-gray-300 text-stone-700
            grow"
          spellcheck={ false }
          disabled={ isSubmitting }
          rows={15}
          {...register("data", {
            required: "Pokémon data must be set",
            validate: validateData,
          })}
        />
        <p class="text-sm text-red-500 empty:before:inline-block">
          {errors.data?.message ?? ""}
        </p>
      </label>
      
      <div class="flex flex-row flex-wrap justify-evenly gap-2 mb-4">
        <GenProvider gen={ generation }>
          {pkmnList.value.map((pkmn) => (<div class="self-center w-max">
            <PokemonSmall pkmn={ pkmn }/>
          </div>))}
        </GenProvider>
      </div>

      <Button type="submit" disabled={!(isValid || isSubmitting)}>
        { !isSubmitting
          ? "Submit"
          /* @ts-expect-error */
          : <AiOutlineLoading className="animate-spin" /> }
      </Button>
    </form>
  )
}
