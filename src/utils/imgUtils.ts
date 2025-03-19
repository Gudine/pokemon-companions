import type { GenderName, SpeciesName } from "@pkmn/data";
import type { CSSProperties } from "preact/compat";
import { Icons, Sprites } from "@pkmn/img";
import imageIndicesRaw from "../imageIndices.json";

const [normalIndices, shinyIndices] = imageIndicesRaw;

const GRID_WIDTH = 40;

const BASE_URL = new URL(import.meta.env.BASE_URL, location.origin);

const gen = 5;
const protocol = window.location.protocol.slice(0, -1) as "http" | "https";
const domain = BASE_URL.host + BASE_URL.pathname;

export const ImgUtils = new class {
  getPokemon(species: SpeciesName, shiny?: boolean, gender?: GenderName): { css: CSSProperties } {
    const pathname = new URL(Sprites.getPokemon(species, { gen, shiny, gender }).url).pathname;
    
    const index = shiny ? shinyIndices.indexOf(pathname) : normalIndices.indexOf(pathname);

    return { css: {
      display: "inline-block",
      width: "96px",
      height: "96px",
      imageRendering: "pixelated",

      ...(index >= 0 ? {
        backgroundImage: `url("${new URL(`sprites/pokemon${shiny ? "shiny" : ""}-sheet.webp`, BASE_URL)}")`,
        backgroundPositionX: `-${(index % GRID_WIDTH) * 96}px`,
        backgroundPositionY: `-${Math.floor(index / GRID_WIDTH) * 96}px`,
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll",
      } : {
        backgroundImage: `url("${new URL("sprites/0.png", BASE_URL)}")`,
      }),
    } };
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