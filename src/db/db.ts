import type { SpeciesName } from "@pkmn/dex";
import type { Sets } from "@pkmn/sets";
import { openDB, DBSchema } from "idb";

export interface IPokemonUnit {
  species: SpeciesName,
  form: SpeciesName,
  playthrough: string,
  data: ReturnType<typeof Sets["packSet"]>,
}

interface PokemonDB extends DBSchema {
  pkmn: {
    value: IPokemonUnit
    key: number;
    indexes: {
      species: IPokemonUnit["species"],
      form: IPokemonUnit["form"],
      playthrough: IPokemonUnit["playthrough"],
    };
  };
}

const db = await openDB<PokemonDB>("mainDB", 1, {
  upgrade(db) {
    const store = db.createObjectStore("pkmn", { autoIncrement: true });
    store.createIndex("species", "species", { unique: false });
    store.createIndex("form", "form", { unique: false });
    store.createIndex("playthrough", "playthrough", { unique: false });
  },
});

export { db };