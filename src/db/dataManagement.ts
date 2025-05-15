import type { MinimalSet } from "@/utils/setUtils/sets";
import { importFromObject, unpackSet } from "@/utils/setUtils";
import { db, type IPlaythrough, type IPokemonUnit } from "./db";

export type ExportedPokemonUnit = Omit<IPokemonUnit, "playthrough" | "data"> & { data: MinimalSet };
export type ExportedPlaythrough = Omit<IPlaythrough, "date"> & { date: string, pokemon: ExportedPokemonUnit[] };

export async function exportData() {
  const t = db.transaction(["pkmn", "playthrough"], "readwrite");

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