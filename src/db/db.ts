import type { GenerationNum, SpeciesName } from "@pkmn/data";
import type { PokemonSet } from "@/utils/setUtils";
import { openDB, type DBSchema } from "idb";

export interface IPokemonUnit {
  id?: number,
  species: SpeciesName,
  form: SpeciesName,
  playthrough: IPlaythroughWithId["id"],
  data: ReturnType<PokemonSet["pack"]>,
}

export interface IPokemonUnitWithId extends IPokemonUnit {
  id: number,
}

export interface IPlaythrough {
  id?: number,
  name: string,
  date: Date,
  gen: GenerationNum,
}

export interface IPlaythroughWithId extends IPlaythrough {
  id: number,
}

export interface PokemonDB extends DBSchema {
  pkmn: {
    value: IPokemonUnit,
    key: IPokemonUnitWithId["id"],
    indexes: {
      species: IPokemonUnit["species"],
      form: IPokemonUnit["form"],
      playthrough: IPokemonUnit["playthrough"],
    },
  },

  playthrough: {
    value: IPlaythrough,
    key: IPlaythroughWithId["id"],
    indexes: {
      name: IPlaythrough["name"],
      date: IPlaythrough["date"],
    },
  },
}

const db = await openDB<PokemonDB>("mainDB", 1, {
  upgrade(db) {
    const pkmnStore = db.createObjectStore("pkmn", { keyPath: "id", autoIncrement: true });
    pkmnStore.createIndex("species", "species", { unique: false });
    pkmnStore.createIndex("form", "form", { unique: false });
    pkmnStore.createIndex("playthrough", "playthrough", { unique: false });

    const playthroughStore = db.createObjectStore("playthrough", { keyPath: "id", autoIncrement: true });
    playthroughStore.createIndex("name", "name", { unique: true });
    playthroughStore.createIndex("date", "date", { unique: false });
  },
});

export { db };