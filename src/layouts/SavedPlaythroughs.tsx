import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Playthrough } from "../db/Playthrough";
import { IPlaythrough } from "../db/db";
import { AddPlaythroughModal } from "../components/AddPlaythroughModal";
import { PlaythroughSection } from "../components/PlaythroughSection";

export function SavedPlaythroughs() {
  const showModal = useSignal(false);
  const playthroughs = useSignal<IPlaythrough[]>([]);

  useEffect(() => {
    (async () => {
      if (showModal.value === false) {
        playthroughs.value = await Playthrough.getAll();
      }
    })();
  }, [showModal.value]);

  return (
    <main class="grid grid-cols-1 grid-rows-1">
      <div class="col-span-full row-span-full flex flex-col gap-4 pt-4 pb-4">
        { playthroughs.value.map((playthrough) => (<PlaythroughSection playthrough={ playthrough }/>))}
        <button
          class="pl-4 pr-4 pt-2 pb-2
            text-xl bg-indigo-700 text-gray-100 hover:bg-indigo-600
            self-center rounded-3xl cursor-pointer"
          onClick={ () => showModal.value = true }
        >
          +
        </button>
      </div>
      { showModal.value && <AddPlaythroughModal close={ () => showModal.value = false } />}
    </main>
  )
}