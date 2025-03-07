import { FaPencil, FaUserPlus, FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { SpeciesPokemonSmall } from "../components/SpeciesPokemonSmall";
import { SetUtils } from "../utils/setUtils";
import { useSignal, useSignalEffect } from "@preact/signals";
import { IPlaythrough, IPokemonUnit } from "../db/db";
import { PokemonUnit } from "../db/PokemonUnit";
import { AddPokemonModal } from "./AddPokemonModal";
import { GenContext } from "../contexts/genContext";

export function PlaythroughSection({ playthrough }: { playthrough: IPlaythrough }) {
  const showModal = useSignal(false);
  const collapsed = useSignal(true);
  const units = useSignal<IPokemonUnit[]>([]);
  
  useSignalEffect(() => {
    (async () => {
      if (showModal.value === false) {
        units.value = await PokemonUnit.getByPlaythrough(playthrough.name);
      }
    })();
  });
  
  useSignalEffect(() => {
    (async () => {
      if (collapsed.value === false) {
        units.value = await PokemonUnit.getByPlaythrough(playthrough.name);
      }
    })();
  });
  
  return (
    <section>
      <header class="bg-indigo-700 text-gray-100
        text-lg p-1
        flex flex-row justify-between">
        <div class="flex flex-row items-center gap-4 pl-2">
          <button
            onClick={ () => collapsed.value = !collapsed.value }
            class="cursor-pointer flex"
          >
            { collapsed.value ? <FaChevronRight title="Expand" /> : <FaChevronDown title="Collapse" /> }
          </button>
          <h2>[{playthrough.date.toLocaleDateString()}] {playthrough.name}</h2>
        </div>
        <div class="pr-4 flex flex-row gap-2 items-center">
          <button
            onClick={ () => showModal.value = true }
            class="cursor-pointer flex"
          >
            <FaUserPlus title="Add Pokémon" />
          </button>
          <button
            class="cursor-pointer flex"
          >
            <FaPencil title="Edit playthrough" />
          </button>
        </div>
      </header>
      { !collapsed.value && (
        <div class="flex flex-row flex-wrap justify-evenly
        bg-indigo-200 border-indigo-700 border-t-0 border-2 border-dashed
          gap-2 p-2 pb-6 mb-2">
          <GenContext value={ { gen: playthrough.gen ?? 9 } }>
            { units.value.map(({ data }) => (
              <SpeciesPokemonSmall key={ data } pkmn={ SetUtils.unpackSet(data)! } />
            )) }
          </GenContext>
        </div>
      )}
      { showModal.value && (<AddPokemonModal
        close={ () => showModal.value = false }
        playthrough={ playthrough.name }
        />
      ) }
    </section>
  )
}