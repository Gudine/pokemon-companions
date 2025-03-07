import { pokemonList } from "../pokemonList";
import { SpeciesBig } from "../components/SpeciesBig";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { PokemonUnit } from "../db/PokemonUnit";

export function SpeciesTracker() {
  const formSet = useSignal<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      formSet.value = new Set((await PokemonUnit.getAll()).map((pkmn) => pkmn.form));
    })();
  }, []);

  return (
    <main class="grid grid-cols-1 grid-rows-1">
      <div class="col-span-full row-span-full flex flex-row flex-wrap justify-evenly gap-2 p-2">
        { [...pokemonList].slice(0,50).map(([name, forms]) => (
          <SpeciesBig
            key={ name }
            name={ name }
            completion={ forms.filter((form) => formSet.value.has(form)).length / forms.length }
          />
        ))}
      </div>
    </main>
  )
}