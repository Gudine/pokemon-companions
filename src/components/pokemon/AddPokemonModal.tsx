import type { FormHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "preact/compat";
import { useComputed, useSignal } from "@preact/signals";
import { AiOutlineLoading } from "react-icons/ai";
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
  playthrough?: string;
}

export function AddPokemonModal({ close, playthrough: defaultPlaythrough }: Props) {
  const isSaving = useSignal(false);
  
  const pkmn = useSignal<PokemonSet>();
  const playthroughs = useDBResource(
    () => Promise.all([Playthrough.getAll(), new Promise<void>((res) => setTimeout(() => res(), 15000))]).then((res) => res[0]),
    "playthrough",
    {},
  );
  
  const playthrough = useSignal<string>(defaultPlaythrough ?? "");

  const generation = useComputed(() => playthroughs.find((p) => p.name === playthrough.value)?.gen);

  const dataError = useSignal("Invalid Pokémon data");
  const playthroughError = useSignal(defaultPlaythrough === undefined ? "Playthrough must be selected" : "");
  
  const submitDisabled = useComputed(() => !!dataError.value || !!playthroughError.value || isSaving.value);

  const handleData: TextareaHTMLAttributes["onChange"] = (ev) => {
    if (!ev.currentTarget.value) {
      pkmn.value = undefined;
      dataError.value = "Invalid Pokémon data";
      return;
    }

    try {
      pkmn.value = importSetWithErrors(
        ev.currentTarget.value,
        generation.value ?? 9,
      );
      dataError.value = "";
    } catch (err) {
      if (err instanceof SetValidationError) {
        dataError.value = err.message;
      } else {
        throw err;
      }

      pkmn.value = undefined;
    }
  };

  const handlePlaythrough: SelectHTMLAttributes["onChange"] = (ev) => {
    playthrough.value = ev.currentTarget.value;
    playthroughError.value = ev.currentTarget.selectedOptions[0].disabled ? "Playthrough must be selected" : "";
  }

  const handleSubmit: FormHTMLAttributes["onSubmit"] = async (ev) => {
    ev.preventDefault();

    if (isSaving.value) throw new Error("Tried to save Pokémon while saving another one");
    isSaving.value = true;

    try {
      await PokemonUnit.add(pkmn.value!, playthrough.value);
      close();
    } catch (err) {
      if (err instanceof Error && err.message.match(/^Species .+? not found$/)) {
        dataError.value = err.message;
      }
    }

    isSaving.value = false;
  }

  return (
    <form
      onSubmit={ handleSubmit }
      class="w-full h-full
      grid grid-cols-2 grid-rows-[max-content_max-content_1fr_max-content] gap-2"
    >
      <p class="text-xl font-bold text-center col-span-2">Add new Pokémon</p>

      <div class="row-span-3 flex flex-col">
        <label for="pokemon-data">
          Data:
        </label>
        <textarea
          class="bg-gray-100 border-2 border-stone-500 rounded-lg
            pt-1 pb-1 pl-2 pr-2
          disabled:bg-gray-300 text-stone-700
            grow"
          id="pokemon-data"
          name="data"
          required
          spellcheck={ false }
          disabled={ isSaving }
          onChange={handleData}
        />
        <p class="text-sm text-red-500 empty:before:inline-block">
          {dataError}
        </p>
      </div>
      
      <div class="flex flex-col">
        <label for="pokemon-playthrough">
          Playthrough:
        </label>
        <select
          class="bg-gray-100 border-2 border-stone-500 rounded-lg
            pt-1 pb-1 pl-2 pr-2
          disabled:bg-gray-300 text-stone-700
          invalid:text-stone-500 *:text-stone-700"
          id="pokemon-playthrough"
          name="playthrough"
          required
          onChange={ handlePlaythrough }
          disabled={ isSaving.value || defaultPlaythrough !== undefined }
        >
          <option selected={playthrough.value === ""} disabled class="hidden" value="">
            -- Select Playthrough --
          </option>
          {playthroughs.map((currPlaythrough) => <option
            value={currPlaythrough.name}
            selected={ currPlaythrough.name === playthrough.value }
          >
            {currPlaythrough.name}
          </option>)}
        </select>
        <p class="text-sm text-red-500 empty:before:inline-block">
          {playthroughError}
        </p>
      </div>
      
      <div class="flex flex-col">
        <p>Preview:</p>
        <GenProvider gen={ generation.value }>
          {pkmn.value && (<div class="self-center w-max">
            <SpeciesPokemonSmall pkmn={ pkmn.value }/>
          </div>)}
        </GenProvider>
      </div>

      <Button class="justify-self-end" type="submit" disabled={submitDisabled}>
        { !isSaving.value
          ? "Submit"
          /* @ts-expect-error */
          : <AiOutlineLoading className="animate-spin" /> }
      </Button>
    </form>
  )
}
