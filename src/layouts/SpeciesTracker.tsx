import { SpeciesSmall } from "@/components/species/SpeciesSmall";
import { SpeciesBig } from "@/components/species/SpeciesBig";
import { PokemonUnit } from "@/db/PokemonUnit";
import { useDBResource } from "@/hooks/useDBResource";
import { pokemonList } from "@/pokemonList";
import { settings } from "@/settings";

export function SpeciesTracker() {
  const formSet = useDBResource(
    async () => new Set((await PokemonUnit.getAll()).map((pkmn) => pkmn.form)),
    "pkmn",
  );

  const SpeciesComponent = settings.smallSpeciesSprites ? SpeciesSmall : SpeciesBig;

  return [...pokemonList].map(([name, forms]) => (
    <SpeciesComponent
      key={ name }
      name={ name }
      completion={ forms.filter((form) => formSet.has(form)).length / forms.length }
    />
  ));
}