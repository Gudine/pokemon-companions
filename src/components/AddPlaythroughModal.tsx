import type { FormHTMLAttributes } from "preact/compat";
import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { AiOutlineLoading } from "react-icons/ai";
import { useSavePlaythrough } from "../hooks/useSavePlaythrough";
import { Modal } from "./common/Modal";
import { Button } from "./common/Button";

const GEN_IDS = ["gen1", "gen2", "gen3", "gen4", "gen5", "gen6", "gen7", "gen8", "gen9"] as const;

export function AddPlaythroughModal({ close }: { close: () => void }) {
  const [savingStatus, save, saveError] = useSavePlaythrough();

  const nameError = useSignal("Name can't be empty");
  const dateError = useSignal("Date must be set");
  
  const inputsDisabled = useComputed(() => savingStatus.value === "saving");
  const submitDisabled = useComputed(() => !!nameError.value || !!dateError.value || savingStatus.value === "saving");
  
  useSignalEffect(() => { if (saveError.value) nameError.value = saveError.value });
  useSignalEffect(() => { if (savingStatus.value === "saved") close() });

  const handleSubmit: FormHTMLAttributes["onSubmit"] = (ev) => {
    ev.preventDefault();
    
    const formData = new FormData(ev.currentTarget);
    
    save({
      name: formData.get("name") as string,
      date: new Date(formData.get("date") as string),
      gen: formData.get("gen") as string,
    });
  }

  return (
    <Modal close={ close } class="w-80 h-100">
      <form
        onSubmit={ handleSubmit }
        class="w-full h-full flex flex-col justify-around *:flex *:flex-col"
      >
        <p class="text-xl font-bold text-center">Add new playthrough</p>

        <div>
          <label for="playthrough-name">
            Name:
          </label>
          <input
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              pt-1 pb-1 pl-2 pr-2
            disabled:bg-gray-300 text-stone-700"
            id="playthrough-name"
            name="name"
            type="text"
            disabled={ inputsDisabled }
            onChange={(ev) => nameError.value = ev.currentTarget.value === "" ? "Name can't be empty" : ""}
          />
          <p class="text-sm text-red-500 empty:before:inline-block">
            {nameError}
          </p>
        </div>
        <div>
          <label for="playthrough-date">
            Date:
          </label>
          <input
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              pt-1 pb-1 pl-2 pr-2
            disabled:bg-gray-300 text-stone-700"
            id="playthrough-date"
            name="date"
            type="date"
            disabled={ inputsDisabled }
            onChange={(ev) => dateError.value = ev.currentTarget.value === "" ? "Date must be set" : ""}
          />
          <p class="text-sm text-red-500 empty:before:inline-block">
            {dateError}
          </p>
        </div>
        <div>
          <label for="playthrough-gen">
            Generation:
          </label>
          <select
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              pt-1 pb-1 pl-2 pr-2
            disabled:bg-gray-300 text-stone-700"
            id="playthrough-gen"
            name="gen"
            disabled={ inputsDisabled }
          >
            {GEN_IDS.map((genId) => <option value={genId} selected={genId === GEN_IDS[GEN_IDS.length - 1]}>
              {genId.slice(-1)}
            </option>)}
          </select>
        </div>
        <Button class="self-end" type="submit" disabled={submitDisabled}>
          { savingStatus.value !== "saving"
            ? "Submit"
            /* @ts-expect-error */
            : <AiOutlineLoading className="animate-spin" /> }
        </Button>
      </form>
    </Modal>
  )
}
