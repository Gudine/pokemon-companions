import { SpeciesName } from "@pkmn/dex";
import { pokemonList } from "../pokemonList";

export function tracePokemon(form: SpeciesName): [species: SpeciesName, form: SpeciesName] | undefined {
  for (const [species, forms] of pokemonList) {
    for (const [formName, aliases] of forms) {
      if ([formName, ...aliases].includes(form)) return [species, formName];
    }
  }
}
