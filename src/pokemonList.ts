import { Dex, Species, SpeciesName } from "@pkmn/dex";

function isFinalStage(pkmn: Species) {
  const evos = pkmn.evos
    ?.map((evo) => Dex.species.get(evo))
    .filter((evo) => evo.gen <= pkmn.gen);
  
  if (!evos?.length) return true;

  if (pkmn.gender) return false;

  return (
    evos.every((evo) => evo.gender)
    && new Set(evos.map((evo) => evo.gender)).size === 1
  );
}

function getParent(pkmn: Species) {
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

const elligiblePokemon = Dex.species.all()
  .filter((pkmn) => !pkmn.isNonstandard || pkmn.isNonstandard === "Past")
  .filter(isFinalStage);

const forms: Map<SpeciesName, SpeciesName[]> = new Map();

for (const pkmn of elligiblePokemon) {
  if (getParent(pkmn) || exclusions.includes(pkmn.name) || pkmn.name.match(/\b(?:Totem)\b/g)) continue;

  forms.set(pkmn.name, []);
}

for (const pkmn of elligiblePokemon) {
  if (!getParent(pkmn) && !exclusions.includes(pkmn.name) && !pkmn.name.match(/\b(?:Totem)\b/g)) continue;

  let base = getParent(pkmn) ?? pkmn.baseSpecies;

  while (!forms.has(base)) {
    const baseSpecies = Dex.species.get(base);
    const newBase = getParent(baseSpecies) ?? baseSpecies.baseSpecies;

    if (newBase === base) {
      console.log(`Base form ${base} is not available`);
      break;
    }

    base = newBase;
  }

  if (!forms.has(base)) continue;

  forms.get(base)!.push(pkmn.name);
}

const unsortedPokemonList: Map<SpeciesName, Map<SpeciesName, SpeciesName[]>> = new Map();

for (const [form, aliases] of [...forms].sort((a, b) => Dex.species.get(a[0]).num - Dex.species.get(b[0]).num)) {
  const base = Dex.species.get(form).baseSpecies;

  if (!unsortedPokemonList.has(base)) unsortedPokemonList.set(base, new Map());

  unsortedPokemonList.get(base)!.set([form, Dex.species.get(form).baseForme].filter(x => x).join("-") as SpeciesName, aliases);
}

export const pokemonList = new Map([...unsortedPokemonList].sort((a, b) => Dex.species.get(a[0]).num - Dex.species.get(b[0]).num));

export function tracePokemon(form: SpeciesName): [species: SpeciesName, form: SpeciesName] | undefined {
  for (const [species, forms] of pokemonList) {
    for (const [formName, aliases] of forms) {
      if ([formName, ...aliases].includes(form)) return [species, formName];
    }
  }
}