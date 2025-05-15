import { StatID, type Generation, type Nature, type Specie, type SpeciesName, type StatsTable } from "@pkmn/data";
import { defaultGen } from "@/data";
import { pokemonList } from "@/pokemonList";

export function isFinalStage(name: SpeciesName, _data?: Generation) {
  const data = _data ?? defaultGen;
  const pkmn = data.species.get(name);
  if (!pkmn) return false;

  const evos = pkmn.evos
    ?.map((evo) => data.species.get(evo))
    .filter((evo) => evo !== undefined)
    .filter((evo) => _data || evo.gen <= pkmn.gen);
  
  if (!evos?.length) return true;

  if (pkmn.gender) return false;

  return (
    evos.every((evo) => evo.gender)
    && new Set(evos.map((evo) => evo.gender)).size === 1
  );
}

export function getImmediateParent(pkmn: Specie) {
  return pkmn.name.endsWith("-Totem")
    ? pkmn.name.slice(0, -6) as SpeciesName
    : pkmn.changesFrom;
}

export function getGenealogies(name: SpeciesName, data: Generation = defaultGen): SpeciesName[][] | undefined {
  const pkmn = data.species.get(name);
  if (!pkmn) return;
  const parentName = getImmediateParent(pkmn) ?? pkmn.name;

  const parentData = data.species.get(parentName);
  if (!parentData) return;

  const immediateNext = getImmediateParent(parentData);
  const nextNames = immediateNext ? [immediateNext] : parentData.evos?.length
    ? parentData.evos : undefined;
  
  if (!nextNames) return [[parentName]];
  
  return nextNames.flatMap((nextName) => {
    if (nextName === parentData.name) return [[parentName]];

    const nextData = data.species.get(nextName);
    if (!nextData) return;
  
    const nextGenealogy = getGenealogies(nextData.name, data);
    if (!nextGenealogy) return;
  
    return nextGenealogy.map((genealogy) => [parentName, ...genealogy]);
  }).filter((elem) => elem !== undefined);
}

export function tracePokemon(form: SpeciesName, _data?: Generation) {
  const data = _data ?? defaultGen;
  const genealogies = getGenealogies(form, data);

  const result = genealogies?.flatMap((genealogy) => {
    const result: [species: SpeciesName, form: SpeciesName][] = [];

    for (const [species, forms] of pokemonList) {
      for (const name of genealogy) {
        if (forms.includes(name) && isFinalStage(name, _data)) {
          result.push([species, name]);
          break;
        }
      }
    }

    return result;
  }).filter((genealogy) => genealogy !== undefined);

  if (result?.length) return result;

  const baseSpecies = data.species.get(form)?.baseSpecies;
  if (baseSpecies) return tracePokemon(baseSpecies);

  return [];
}

function calcStat(
  data: Generation,
  stat: StatID,
  base: number,
  iv?: number,
  ev?: number,
  level?: number,
  nature?: Nature
) {
  return data.stats.calc(
    stat,
    base,
    (iv && data.num <= 2) ? iv * 2 : iv,
    (ev && data.num <= 2) ? Math.sqrt(ev) : ev,
    level,
    nature
  );
}

export function getStats(
  data: Generation,
  species: Specie,
  ivs?: Partial<StatsTable>,
  evs?: Partial<StatsTable>,
  level?: number,
  nature?: Nature,
) {
  return new Map([...data.stats]
    .filter((stat) => data.num !== 1 || stat !== "spd")
    .map((stat) => {
      const value = calcStat(
        data,
        stat,
        species.baseStats[stat],
        !Number.isNaN(ivs?.[stat]) ? ivs?.[stat] : undefined,
        !Number.isNaN(evs?.[stat]) ? evs?.[stat] : undefined,
        !Number.isNaN(level) ? level : undefined,
        nature,
      );

      return [stat, value];
    }));
}