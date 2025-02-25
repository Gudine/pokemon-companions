import { pokemonList } from "./pokemonList";
import { SpeciesBig } from "./components/SpeciesBig";

export function App() {
  return (
    <main class="flex flex-row flex-wrap justify-evenly gap-2 bg-stone-300">
      { [...pokemonList].slice(0).map(([name]) => (
        <SpeciesBig name={ name } />
      ))}
    </main>
  )
}
