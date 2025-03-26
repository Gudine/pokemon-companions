import { useSignal } from "@preact/signals";
import { createPortal, Suspense } from "preact/compat";
import { AddPlaythroughModal } from "@/components/playthrough/AddPlaythroughModal";
import { Loading } from "@/components/common/Loading";
import { SavedPlaythroughs } from "./SavedPlaythroughs";

export function SavedPlaythroughsContainer() {
  const showModal = useSignal(false);

  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-col gap-4 py-4">
        <Suspense fallback={ <Loading /> }>
          <SavedPlaythroughs />
          <button
            class="px-4 py-2
              text-xl bg-indigo-700 text-gray-100 hover:bg-indigo-600
              self-center rounded-3xl cursor-pointer"
            onClick={ () => showModal.value = true }
          >
            +
          </button>
        </Suspense>
      </div>
      { showModal.value && createPortal(<AddPlaythroughModal close={ () => showModal.value = false } />, document.body)}
    </main>
  )
}