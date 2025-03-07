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
import { useSavePokemon } from "../hooks/useSavePokemon";
import { AiOutlineLoading } from "react-icons/ai";

interface Props {
  close: () => void;
  playthrough?: string;
}

export function AddPokemonModal({ close, playthrough }: Props) {
  const [savingStatus, save, saveError] = useSavePokemon();

  const pkmn = useSignal<PartialPkmnSet>();
  const playthroughs = useSignal<string[]>([]);

  const dataError = useSignal("Invalid Pokémon data");
  const playthroughError = useSignal(playthrough === undefined ? "Playthrough must be selected" : "");

  useSignalEffect(() => { dataError.value = pkmn.value ? "" : "Invalid Pokémon data" });
  
  const inputsDisabled = useComputed(() => savingStatus.value === "saving");
  const submitDisabled = useComputed(() => !!dataError.value || !!playthroughError.value || savingStatus.value === "saving");
  
  useSignalEffect(() => { if (saveError.value) dataError.value = saveError.value });
  useSignalEffect(() => { if (savingStatus.value === "saved") close() });

  useEffect(() => {
    (async () => {
      const playthroughsRaw = await Playthrough.getAll();
      playthroughs.value = playthroughsRaw.map((p) => p.name);
    })();
  }, [playthroughs]);

  const handleData: TextareaHTMLAttributes["onChange"] = (ev) => {
    const set = SetUtils.importSet(ev.currentTarget.value);

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
    playthroughError.value = ev.currentTarget.selectedOptions[0].disabled ? "Playthrough must be selected" : "";
  }

  const handleSubmit: FormHTMLAttributes["onSubmit"] = (ev) => {
    ev.preventDefault();
    
    const formData = new FormData(ev.currentTarget);
    
    save(pkmn.value!, (formData.get("playthrough") as string | undefined) ?? playthrough!);
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
            disabled={ inputsDisabled }
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
            onChange={handlePlaythrough}
            disabled={ inputsDisabled.value || playthrough !== undefined }
          >
            <option selected={playthrough === undefined} disabled class="hidden" value="">
              -- Select Playthrough --
            </option>
            {playthroughs.value.map((currPlaythrough) => <option
              value={currPlaythrough}
              selected={ currPlaythrough === playthrough }
            >
              {currPlaythrough}
            </option>)}
          </select>
          <p class="text-sm text-red-500 empty:before:inline-block">
            {playthroughError}
          </p>
        </div>
        
        <div class="flex flex-col">
          <p>Preview:</p>
          {pkmn.value && (<div class="self-center w-max">
            <SpeciesPokemonSmall pkmn={ pkmn.value }/>
          </div>)}
        </div>

        <Button class="justify-self-end" type="submit" disabled={submitDisabled}>
          { savingStatus.value !== "saving"
            ? "Submit"
            /* @ts-expect-error */
            : <AiOutlineLoading className="animate-spin" /> }
        </Button>
      </form>
    </Modal>
  )
}
