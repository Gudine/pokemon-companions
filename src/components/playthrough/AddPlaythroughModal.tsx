import type { FormHTMLAttributes } from "preact/compat";
import type { GenerationNum } from "@pkmn/data";
import { useComputed, useSignal } from "@preact/signals";
import { AiOutlineLoading } from "react-icons/ai";
import { Playthrough } from "@/db/Playthrough";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function AddPlaythroughModal({ close }: { close: () => void }) {
  const isSaving = useSignal(false);

  const nameError = useSignal("Name can't be empty");
  const dateError = useSignal("Date must be set");
  
  const submitDisabled = useComputed(() => !!nameError.value || !!dateError.value || isSaving.value);

  const handleSubmit: FormHTMLAttributes["onSubmit"] = async (ev) => {
    ev.preventDefault();

    if (isSaving.value) throw new Error("Tried to save playthrough while saving another one");
    isSaving.value = true;
    
    const formData = new FormData(ev.currentTarget);
    
    try {
      await Playthrough.add(
        formData.get("name") as string,
        new Date(formData.get("date") as string),
        Number(formData.get("gen")) as GenerationNum,
      );

      close();
    } catch (err) {
      if (err instanceof DOMException && err.name === "ConstraintError") {
        nameError.value = "Name already exists";
      }
    }

    isSaving.value = false;
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
            disabled={ isSaving }
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
            disabled={ isSaving }
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
            disabled={ isSaving }
          >
            {GENS.map((genId) => <option value={genId} selected={genId === GENS[GENS.length - 1]}>
              {genId}
            </option>)}
          </select>
        </div>
        <Button class="self-end" type="submit" disabled={submitDisabled}>
          { !isSaving.value
            ? "Submit"
            /* @ts-expect-error */
            : <AiOutlineLoading className="animate-spin" /> }
        </Button>
      </form>
    </Modal>
  )
}
