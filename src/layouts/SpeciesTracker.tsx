import { useSignal } from "@preact/signals";
import { pokemonList } from "../pokemonList";
import { CornerButton } from "../components/common/CornerButton";
import { SpeciesBig } from "../components/SpeciesBig";
import { AddPokemonModal } from "../components/AddPokemonModal";

export function SpeciesTracker() {
  const showModal = useSignal(false);

  return (
    <main class="grid grid-cols-1 grid-rows-1">
      <div class="col-span-full row-span-full flex flex-row flex-wrap justify-evenly gap-2 p-2">
        { [...pokemonList].slice(0,50).map(([name]) => (
          <SpeciesBig key={ name } name={ name } />
        ))}
      </div>
      <CornerButton onClick={ () => showModal.value = true } />
      { showModal.value && <AddPokemonModal close={ () => showModal.value = false } />}
    </main>
  )
}