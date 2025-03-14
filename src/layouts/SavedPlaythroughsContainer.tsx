import { useSignal } from "@preact/signals";
import { AddPlaythroughModal } from "../components/AddPlaythroughModal";
import { SavedPlaythroughs } from "./SavedPlaythroughs";
import { Loading } from "../components/common/Loading";
import { Suspense } from "preact/compat";

export function SavedPlaythroughsContainer() {
  const showModal = useSignal(false);

  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-col gap-4 pt-4 pb-4">
        <Suspense fallback={ <Loading /> }>
          <SavedPlaythroughs />
          <button
            class="pl-4 pr-4 pt-2 pb-2
              text-xl bg-indigo-700 text-gray-100 hover:bg-indigo-600
              self-center rounded-3xl cursor-pointer"
            onClick={ () => showModal.value = true }
          >
            +
          </button>
        </Suspense>
      </div>
      { showModal.value && <AddPlaythroughModal close={ () => showModal.value = false } />}
    </main>
  )
}