import { pokemonList } from "../pokemonList";
import { SpeciesBig } from "../components/SpeciesBig";

export function SpeciesTracker() {
  return (
    <main class="grid grid-cols-1 grid-rows-1">
      <div class="col-span-full row-span-full flex flex-row flex-wrap justify-evenly gap-2 p-2">
        { [...pokemonList].slice(0,50).map(([name]) => (
          <SpeciesBig key={ name } name={ name } />
        ))}
      </div>
    </main>
  )
}