import { pokemonList } from "./pokemonList";
import { SpeciesBig } from "./components/SpeciesBig";

export function App() {
  return (
    <div class="flex flex-col bg-stone-200 font-nunito">
      <header class="text-center text-indigo-700 p-2 font-kodchasan">
        <h1 class="font-bold text-5xl">Pokémon Individual Tracker</h1>
        <p class="text-lg">To keep track of all your favorite companions</p>
      </header>
      <nav class="flex flex-row justify-stretch
        bg-indigo-700 text-gray-100
        text-xl text-center">
        <a
          class="p-3 grow cursor-pointer border-1 border-indigo-700
            hover:bg-gray-100 hover:text-indigo-700
            bg-gray-100 text-indigo-700"
        >
          Species tracker
        </a>
        <a
          class="p-3 grow cursor-pointer border-1 border-indigo-700
            hover:bg-gray-100 hover:text-indigo-700"
        >
          Saved Pokémon
        </a>
      </nav>
      <main class="flex flex-row flex-wrap justify-evenly gap-2 p-2">
        { [...pokemonList].slice(0,50).map(([name]) => (
          <SpeciesBig key={ name } name={ name } />
        ))}
      </main>
      <footer class="bg-indigo-700 text-gray-100 text-center p-2 text-xs">
        Partly inspired by{" "}
        <a
          class="text-cyan-400 visited:text-cyan-500 hover:text-cyan-300 active:text-cyan-300"
          href="https://i-made-a.website/pokemon_gen3/pokedex_tracker"
        >
          Lyra's Living Pokédex Tracker
        </a>
        .
      </footer>
    </div>
  )
}
