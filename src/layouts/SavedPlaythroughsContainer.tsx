import { Suspense } from "preact/compat";
import { showPlaythroughEditor } from "@/components/playthrough/showPlaythroughEditor";
import { Loading } from "@/components/common/Loading";
import { SavedPlaythroughs } from "./SavedPlaythroughs";

export function SavedPlaythroughsContainer() {
  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-col gap-4 py-4">
        <Suspense fallback={ <Loading /> }>
          <SavedPlaythroughs />
          <button
            class="px-4 py-2
              text-xl bg-indigo-700 text-gray-100 hover:bg-indigo-600
              self-center rounded-3xl cursor-pointer"
            onClick={ () => showPlaythroughEditor.call({}) }
          >
            +
          </button>
        </Suspense>
      </div>
    </main>
  )
}