import { pokemonList } from "../pokemonList";
import { SpeciesBig } from "../components/SpeciesBig";

export function Main() {
  return (
    <main class="flex flex-row flex-wrap justify-evenly gap-2 p-2">
      { [...pokemonList].slice(0,50).map(([name]) => (
        <SpeciesBig key={ name } name={ name } />
      )) }
    </main>
  )
}


