import type { Generation, Specie, SpeciesName } from "@pkmn/data";
import { defaultGen } from "@/data";
import { pokemonList } from "@/pokemonList";

export function getImmediateParent(pkmn: Specie) {
  return pkmn.name.endsWith("-Totem")
    ? pkmn.name.slice(0, -6) as SpeciesName
    : pkmn.changesFrom;
}

export function getGenealogies(pkmn: Specie): SpeciesName[][] | undefined {
  const parentName = getImmediateParent(pkmn) ?? pkmn.name;

  const parentData = defaultGen.species.get(parentName);
  if (!parentData) return;

  const immediateNext = getImmediateParent(parentData);
  const nextNames = immediateNext ? [immediateNext] : parentData.evos?.length
    ? parentData.evos : [parentData.baseSpecies];
  
  return nextNames.flatMap((nextName) => {
    if (nextName === parentData.name) return [[parentName]];

    const nextData = defaultGen.species.get(nextName);
    if (!nextData) return;
  
    const nextGenealogy = getGenealogies(nextData);
    if (!nextGenealogy) return;
  
    return nextGenealogy.map((genealogy) => [parentName, ...genealogy]);
  }).filter((elem) => elem !== undefined);
}

export function isFinalStage(pkmn: Specie, data: Generation = defaultGen) {
  const evos = pkmn.evos
    ?.map((evo) => data.species.get(evo))
    .filter((evo) => evo !== undefined)
    .filter((evo) => evo.gen <= pkmn.gen);
  
  if (!evos?.length) return true;

  if (pkmn.gender) return false;

  return (
    evos.every((evo) => evo.gender)
    && new Set(evos.map((evo) => evo.gender)).size === 1
  );
}

export function tracePokemon(form: SpeciesName) {
  const data = defaultGen.species.get(form);
  if (!data) return [];

  const genealogies = getGenealogies(data);

  return genealogies?.map<[species: SpeciesName, form: SpeciesName] | undefined>((genealogy) => {
    for (const [species, forms] of pokemonList) {
      for (const name of genealogy) {
        if (forms.includes(name)) return [species, name];
      }
    }
  }).filter((genealogy) => genealogy !== undefined) ?? [];
}
