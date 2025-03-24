import type { IPlaythrough } from "@/db/db";
import { FaPencil, FaUserPlus, FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { useSignal } from "@preact/signals";
import { createPortal, Suspense } from "preact/compat";
import { Loading } from "@/components/common/Loading";
import { PlaythroughSectionList } from "./PlaythroughSectionList";
import { AddPlaythroughModal } from "./AddPlaythroughModal";
import { selectedPage, storedFormData } from "@/globalState";

export function PlaythroughSection({ playthrough }: { playthrough: IPlaythrough }) {
  const showPlaythroughModal = useSignal(false);
  const collapsed = useSignal(true);
  
  return (
    <section>
      <header class="bg-indigo-700 text-gray-100
        text-lg p-1
        flex flex-row justify-between">
        <div class="flex flex-row items-center gap-2 pl-2">
          <button
            onClick={ () => collapsed.value = !collapsed.value }
            class="cursor-pointer flex"
          >
            { collapsed.value ? <FaChevronRight title="Expand" /> : <FaChevronDown title="Collapse" /> }
          </button>
          <button
            onClick={ () => showPlaythroughModal.value = true }
            class={`cursor-pointer flex ${collapsed.value ? "invisible" : ""}`}
          >
            <FaPencil title="Edit playthrough" />
          </button>
          <button
            onClick={ () => {
              storedFormData.value = { playthrough: playthrough.id };
              selectedPage.value = "pokemonWorkshop";
            } }
            class={`cursor-pointer flex ${collapsed.value ? "invisible" : ""}`}
          >
            <FaUserPlus title="Add Pokémon" />
          </button>
          <h2>[{playthrough.date.toLocaleDateString(undefined, {
            timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit",
          })}] {playthrough.name}</h2>
        </div>
      </header>
      { !collapsed.value && (
        <div class="flex flex-row flex-wrap justify-evenly
        bg-indigo-200 border-indigo-700 border-t-0 border-2 border-dashed
          gap-2 p-2 pb-6 mb-2">
          <Suspense fallback={ <Loading /> }>
            <PlaythroughSectionList playthrough={ playthrough } />
          </Suspense>
        </div>
      )}
      { showPlaythroughModal.value && createPortal(<AddPlaythroughModal
        close={ () => showPlaythroughModal.value = false }
        playthrough={ playthrough }
      />, document.body)}
    </section>
  )
}