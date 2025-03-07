import { SpeciesName } from "@pkmn/data";
import { defaultGen } from "./data";
import { getImmediateParent } from "./utils/pkmnUtils";

const exclusions = [
  // Pokémon that have no move or ability difference
  "Pikachu-Cosplay",
  "Pikachu-Original",
  "Pikachu-Hoenn",
  "Pikachu-Sinnoh",
  "Pikachu-Unova",
  "Pikachu-Kalos",
  "Pikachu-Alola",
  "Pikachu-Partner",
  "Pikachu-World",
  "Pichu-Spiky-eared",
  "Vivillon-Fancy",
  "Vivillon-Pokeball",
  "Floette-Eternal",
  "Gourgeist-Small",
  "Gourgeist-Large",
  "Gourgeist-Super",
  "Magearna-Original",
  "Sinistea-Antique",
  "Polteageist-Antique",
  "Eternatus-Eternamax",
  "Zarude-Dada",
  "Ursaluna-Bloodmoon",
  "Maushold-Four",
  "Dudunsparce-Three-Segment",
  "Poltchageist-Artisan",
  "Sinistcha-Masterpiece",
];

const elligiblePokemon = defaultGen.species;

const forms: SpeciesName[] = [];

for (const pkmn of elligiblePokemon) {
  if (getImmediateParent(pkmn) || exclusions.includes(pkmn.name)) continue;

  forms.push(pkmn.name);
}

const unsortedPokemonList: Map<SpeciesName, SpeciesName[]> = new Map();

for (const form of [...forms].sort((a, b) => elligiblePokemon.get(a)!.num - elligiblePokemon.get(b)!.num)) {
  const base = elligiblePokemon.get(form)!.baseSpecies;

  if (!unsortedPokemonList.has(base)) unsortedPokemonList.set(base, []);

  unsortedPokemonList.get(base)!.push(form);
}

export const pokemonList = new Map([...unsortedPokemonList].sort((a, b) => elligiblePokemon.get(a[0])!.num - elligiblePokemon.get(b[0])!.num));
