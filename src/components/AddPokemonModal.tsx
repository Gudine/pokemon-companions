import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { Modal } from "./common/Modal";
import { SpeciesName } from "@pkmn/dex";
import { useEffect } from "preact/hooks";
import { Playthrough } from "../db/Playthrough";
import { FormHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "preact/compat";
import { SpeciesPokemonSmall } from "./SpeciesPokemonSmall";
import { tracePokemon } from "../utils/pkmnUtils";
import { PartialPkmnSet, SetUtils } from "../utils/setUtils";
import { Button } from "./common/Button";
import { AiOutlineLoading } from "react-icons/ai";
import { IPlaythrough } from "../db/db";
import { gens } from "../data";
import { GenProvider } from "../contexts/GenContext";
import { PokemonUnit } from "../db/PokemonUnit";

interface Props {
  close: () => void;
  playthrough?: string;
}

export function AddPokemonModal({ close, playthrough: defaultPlaythrough }: Props) {
  const isSaving = useSignal(false);

  const pkmn = useSignal<PartialPkmnSet>();
  const playthroughs = useSignal<IPlaythrough[]>([]);
  
  const playthrough = useSignal<string>(defaultPlaythrough ?? "");

  const generation = useComputed(() => playthroughs.value.find((p) => p.name === playthrough.value)?.gen);

  const dataError = useSignal("Invalid Pokémon data");
  const playthroughError = useSignal(defaultPlaythrough === undefined ? "Playthrough must be selected" : "");

  useSignalEffect(() => { dataError.value = pkmn.value ? "" : "Invalid Pokémon data" });
  
  const submitDisabled = useComputed(() => !!dataError.value || !!playthroughError.value || isSaving.value);

  useEffect(() => {
    (async () => {
      playthroughs.value = await Playthrough.getAll();
    })();
  }, [playthroughs, playthrough]);

  const handleData: TextareaHTMLAttributes["onChange"] = (ev) => {
    const set = SetUtils.importSet(
      ev.currentTarget.value,
      generation.value ? gens.get(generation.value) : undefined
    );

    if (!set) {
      pkmn.value = undefined;
      return;
    }

    const traced = tracePokemon(set.species as SpeciesName);

    if (traced) {
      set.species = traced[1];
      pkmn.value = set;
    } else {
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
    <Modal close={ close } class="w-9/10 h-9/10">
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
            {playthroughs.value.map((currPlaythrough) => <option
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
    </Modal>
  )
}
