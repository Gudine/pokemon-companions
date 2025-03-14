import type { GenderName, SpeciesName } from "@pkmn/data";
import { Icons, Sprites } from "@pkmn/img";

const gen = 5;
const protocol = window.location.protocol.slice(0, -1) as "http" | "https";
const domain = window.location.host;

export const ImgUtils = new class {
  getPokemon(species: SpeciesName, shiny?: boolean, gender?: GenderName) {
    return Sprites.getPokemon(species, { gen, protocol, domain, shiny, gender });
  }

  getPokemonIcon(species: SpeciesName, gender?: GenderName) {
    return Icons.getPokemon(species, { protocol, domain, gender });
  }

  getItem(item: string) {
    return Icons.getItem(item, { protocol, domain });
  }
  
  getPokeball(pokeball: string) {
    return Icons.getPokeball(pokeball, { protocol, domain });
  }

  getSubstitute() {
    return Sprites.getSubstitute({ gen, protocol, domain });
  }
}