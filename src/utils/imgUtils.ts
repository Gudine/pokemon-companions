import type { GenderName, SpeciesName } from "@pkmn/data";
import { Icons, Sprites } from "@pkmn/img";
import invalidImagesArr from "../invalidImages.json";

const invalidImages = new Set(invalidImagesArr);

const gen = 5;
const protocol = window.location.protocol.slice(0, -1) as "http" | "https";
const domain = window.location.host;

export const ImgUtils = new class {
  getPokemon(species: SpeciesName, shiny?: boolean, gender?: GenderName) {
    const result = Sprites.getPokemon(species, { gen, protocol, domain, shiny, gender });

    if (!invalidImages.has(new URL(result.url).pathname)) return result;
    return { ...result, url: "/sprites/0.png" };
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