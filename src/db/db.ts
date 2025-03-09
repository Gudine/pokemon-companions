import type { GenerationNum, SpeciesName } from "@pkmn/data";
import { openDB, DBSchema } from "idb";
import { SetUtils } from "../utils/setUtils";

export interface IPokemonUnit {
  id?: number,
  species: SpeciesName,
  form: SpeciesName,
  playthrough: IPlaythrough["name"],
  data: ReturnType<typeof SetUtils["packSet"]>,
}

export interface IPokemonUnitWithId extends IPokemonUnit {
  id: number,
}

export interface IPlaythrough {
  name: string,
  date: Date,
  gen: GenerationNum,
}

interface PokemonDB extends DBSchema {
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
    key: IPlaythrough["name"],
    indexes: {
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

    const playthroughStore = db.createObjectStore("playthrough", { keyPath: "name" });
    playthroughStore.createIndex("date", "date", { unique: false });
  },
});

export { db };