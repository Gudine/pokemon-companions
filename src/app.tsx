import { pokemonList } from "./pokemonList";
import { SpeciesBig } from "./components/SpeciesBig";
import { Header } from "./layouts/Header";
import { Navigation } from "./layouts/Navigation";
import { Footer } from "./layouts/Footer";

export function App() {
  return (
    <div class="flex flex-col bg-stone-200 font-nunito">
      <Header />
      <Navigation />
      <main class="flex flex-row flex-wrap justify-evenly gap-2 p-2">
        { [...pokemonList].slice(0,50).map(([name]) => (
          <SpeciesBig key={ name } name={ name } />
        )) }
      </main>
      <Footer />
    </div>
  )
}
