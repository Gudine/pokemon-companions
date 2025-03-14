import type { IPlaythrough } from "@/db/db";
import { FaPencil, FaUserPlus, FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { useSignal } from "@preact/signals";
import { Suspense } from "preact/compat";
import { Loading } from "@/components/common/Loading";
import { AddPokemonModalContainer } from "@/components/pokemon/AddPokemonModalContainer";
import { PlaythroughSectionList } from "./PlaythroughSectionList";

export function PlaythroughSection({ playthrough }: { playthrough: IPlaythrough }) {
  const showModal = useSignal(false);
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
            class={`cursor-pointer flex ${collapsed.value ? "invisible" : ""}`}
          >
            <FaPencil title="Edit playthrough" />
          </button>
          <button
            onClick={ () => showModal.value = true }
            class={`cursor-pointer flex ${collapsed.value ? "invisible" : ""}`}
          >
            <FaUserPlus title="Add Pokémon" />
          </button>
          <h2>[{playthrough.date.toLocaleDateString()}] {playthrough.name}</h2>
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
      { showModal.value && (<AddPokemonModalContainer
        close={ () => showModal.value = false }
        playthrough={ playthrough.name }
        />
      ) }
    </section>
  )
}