import { Specie, SpeciesName } from "@pkmn/data";
import { defaultGen } from "./data";

function getParent(pkmn: Specie) {
  return pkmn.name.endsWith("-Totem")
    ? pkmn.name.slice(0, -6) as SpeciesName
    : pkmn.changesFrom ?? (Array.isArray(pkmn.battleOnly) ? pkmn.battleOnly[0] : pkmn.battleOnly);
}

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

const forms: Map<SpeciesName, SpeciesName[]> = new Map();

for (const pkmn of elligiblePokemon) {
  if (getParent(pkmn) || exclusions.includes(pkmn.name) || pkmn.name.match(/\b(?:Totem)\b/g)) continue;

  forms.set(pkmn.name, []);
}

for (const pkmn of elligiblePokemon) {
  if (!getParent(pkmn) && !exclusions.includes(pkmn.name) && !pkmn.name.match(/\b(?:Totem)\b/g)) continue;

  let base = getParent(pkmn) ?? pkmn.baseSpecies;

  while (!forms.has(base)) {
    const baseSpecies = elligiblePokemon.get(base);
    const newBase = baseSpecies && (getParent(baseSpecies) ?? baseSpecies.baseSpecies);

    if (!newBase || newBase === base) {
      console.debug(`Base form ${base} is not available`);
      break;
    }

    base = newBase;
  }

  if (!forms.has(base)) continue;

  forms.get(base)!.push(pkmn.name);
}

const unsortedPokemonList: Map<SpeciesName, Map<SpeciesName, SpeciesName[]>> = new Map();

for (const [form, aliases] of [...forms].sort((a, b) => elligiblePokemon.get(a[0])!.num - elligiblePokemon.get(b[0])!.num)) {
  const base = elligiblePokemon.get(form)!.baseSpecies;

  if (!unsortedPokemonList.has(base)) unsortedPokemonList.set(base, new Map());

  unsortedPokemonList.get(base)!.set([form, elligiblePokemon.get(form)!.baseForme].filter(x => x).join("-") as SpeciesName, aliases);
}

export const pokemonList = new Map([...unsortedPokemonList].sort((a, b) => elligiblePokemon.get(a[0])!.num - elligiblePokemon.get(b[0])!.num));
