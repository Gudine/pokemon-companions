import { Specie, SpeciesName } from "@pkmn/data";
import { defaultGen } from "../data";
import { pokemonList } from "../pokemonList";

export function getImmediateParent(pkmn: Specie) {
  return pkmn.name.endsWith("-Totem")
    ? pkmn.name.slice(0, -6) as SpeciesName
    : pkmn.changesFrom;
}

export function getGenealogy(pkmn: Specie) {
  const tree: SpeciesName[] = [];

  const immediateParent = getImmediateParent(pkmn);
  if (!immediateParent) tree.push(pkmn.name);

  let parent = immediateParent ?? pkmn.baseSpecies;

  while (true) {
    const parentData = defaultGen.species.get(parent);

    if (!parentData) return;
    if (parentData.name === tree[tree.length - 1]) return tree;
    tree.push(parentData.name);

    parent = getImmediateParent(parentData) ?? parentData.baseSpecies;
  }
}

export function tracePokemon(form: SpeciesName): [species: SpeciesName, form: SpeciesName] | undefined {
  const data = defaultGen.species.get(form);
  if (!data) return;

  const genealogy = getGenealogy(data);

  for (const [species, forms] of pokemonList) {
    for (const name of genealogy ?? []) {
      if (forms.includes(name)) return [species, name];
    }
  }
}
