import { pokemonList } from "../pokemonList";
import { SpeciesBig } from "../components/SpeciesBig";
import { PokemonUnit } from "../db/PokemonUnit";
import { useDBResource } from "../hooks/useDBResource";

export function SpeciesTracker() {
  const formSet = useDBResource(
    async () => new Set((await PokemonUnit.getAll()).map((pkmn) => pkmn.form)),
    "pkmn",
  );

  return [...pokemonList].slice(0,50).map(([name, forms]) => (
    <SpeciesBig
      key={ name }
      name={ name }
      completion={ forms.filter((form) => formSet.has(form)).length / forms.length }
    />
  ));
}