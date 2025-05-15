import type { MinimalSet } from "@/utils/setUtils/sets";
import { type Team, Teams } from "@/utils/setUtils/teams";
import { importFromObject, unpackSet } from "@/utils/setUtils";
import { db, type IPlaythrough, type IPokemonUnit } from "./db";

export type ExportedPokemonUnit = Omit<IPokemonUnit, "playthrough" | "data"> & { data: MinimalSet };
export type ExportedPlaythrough = Omit<IPlaythrough, "date"> & { date: string, pokemon: ExportedPokemonUnit[] };

export async function exportData() {
  const t = db.transaction(["pkmn", "playthrough"], "readonly");

  const result: ExportedPlaythrough[] = [];

  for await (const c of t.objectStore("playthrough")) {
    const playthrough = c.value as IPlaythrough;
    const rawPokemon = (await t.objectStore("pkmn").index("playthrough").getAll(playthrough.id)) as IPokemonUnit[];

    const pokemon = rawPokemon.map(({ playthrough: {}, ...pkmn }) => ({
      ...pkmn,
      data: unpackSet(pkmn.data, playthrough.gen)!.toObject(false),
    }));

    result.push({ ...playthrough, date: playthrough.date.toISOString(), pokemon });
  }
  
  return result;
}

export async function exportTeams() {
  const t = db.transaction(["pkmn", "playthrough"], "readonly");

  const result: Team[] = [];

  for await (const c of t.objectStore("playthrough")) {
    const playthrough = c.value as IPlaythrough;
    const rawPokemon = (await t.objectStore("pkmn").index("playthrough").getAll(playthrough.id)) as IPokemonUnit[];

    const pokemon = rawPokemon.map((pkmn) => unpackSet(pkmn.data, playthrough.gen)!.toObject(false));

    result.push({
      name: `${playthrough.name} (${playthrough.date.toISOString().slice(0,10)})`,
      format: `gen${playthrough.gen}`,
      team: pokemon,
    });
  }
  
  return Teams.exportTeams(result);
}

export async function importData(data: ExportedPlaythrough[]) {
  const playthroughs: IPlaythrough[] = data.map(({ date, pokemon, ...playthrough }) => ({ ...playthrough, date: new Date(date) }));

  const pokemonUnits: IPokemonUnit[] = data.flatMap(({ id, gen, pokemon }) => pokemon.map(({ data, ...pkmn }) => ({
    ...pkmn,
    playthrough: id,
    data: importFromObject(data, gen).pack(),
  })));

  const t = db.transaction(["pkmn", "playthrough"], "readwrite");

  await Promise.all([
    t.objectStore("pkmn").clear(),
    t.objectStore("playthrough").clear(),
  ]);

  await Promise.all(playthroughs.map((playthrough) => t.objectStore("playthrough").add(playthrough)));
  await Promise.all(pokemonUnits.map((pkmn) => t.objectStore("pkmn").add(pkmn)));

  return [playthroughs, pokemonUnits];
}

export async function clearData() {
  const t = db.transaction(["pkmn", "playthrough"], "readwrite");

  await Promise.all([
    t.objectStore("pkmn").clear(),
    t.objectStore("playthrough").clear(),
  ]);
}