import { pokemonList } from "../pokemonList";
import { SpeciesBig } from "../components/SpeciesBig";
import { SpeciesPokemonSmall } from "../components/SpeciesPokemonSmall";
import { generatePokemon } from "../demoSets";
import { CornerButton } from "../components/common/CornerButton";
import { AddPlaythroughModal } from "../components/AddPlaythroughModal";
import { selectedPage } from "../globalState";
import { useSignal } from "@preact/signals";

export function Main() {
  const showModal = useSignal(false);

  return (
    <main class="grid grid-cols-1 grid-rows-1">
      <div class="col-span-full row-span-full flex flex-row flex-wrap justify-evenly gap-2 p-2">
        { selectedPage.value === "species" && [...pokemonList].slice(0,50).map(([name]) => (
          <SpeciesBig key={ name } name={ name } />
        ))}
        { selectedPage.value === "pokemon" && [...pokemonList].slice(-50).map(([name]) => (
          <SpeciesPokemonSmall key={ name } pkmn={ generatePokemon(name) } />
        ))}
      </div>
      <CornerButton onClick={ () => showModal.value = true } />
      { showModal.value && <AddPlaythroughModal close={ () => showModal.value = false } />}
    </main>
  )
}