import { useSignal } from "@preact/signals";
import { pokemonList } from "../pokemonList";
import { generatePokemon } from "../demoSets";
import { CornerButton } from "../components/common/CornerButton";
import { SpeciesPokemonSmall } from "../components/SpeciesPokemonSmall";
import { AddPlaythroughModal } from "../components/AddPlaythroughModal";

export function SavedPlaythroughs() {
  const showModal = useSignal(false);

  return (
    <main class="grid grid-cols-1 grid-rows-1">
      <div class="col-span-full row-span-full flex flex-row flex-wrap justify-evenly gap-2 p-2">
        { [...pokemonList].slice(-50).map(([name]) => (
          <SpeciesPokemonSmall key={ name } pkmn={ generatePokemon(name) } />
        ))}
      </div>
      <CornerButton onClick={ () => showModal.value = true } />
      { showModal.value && <AddPlaythroughModal close={ () => showModal.value = false } />}
    </main>
  )
}