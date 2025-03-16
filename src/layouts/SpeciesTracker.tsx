import { SpeciesBig } from "@/components/species/SpeciesBig";
import { PokemonUnit } from "@/db/PokemonUnit";
import { useDBResource } from "@/hooks/useDBResource";
import { pokemonList } from "@/pokemonList";

export function SpeciesTracker() {
  const formSet = useDBResource(
    async () => new Set((await PokemonUnit.getAll()).map((pkmn) => pkmn.form)),
    "pkmn",
  );

  return [...pokemonList].map(([name, forms]) => (
    <SpeciesBig
      key={ name }
      name={ name }
      completion={ forms.filter((form) => formSet.has(form)).length / forms.length }
    />
  ));
}