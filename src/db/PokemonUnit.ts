import { SpeciesName } from "@pkmn/data";
import { db, type IPokemonUnitWithId, type IPokemonUnit } from "./db";
import { tracePokemon } from "../utils/pkmnUtils";
import { type PokemonSet, importFromObject } from "../utils/setUtils";
import { type MinimalSet, Sets } from "../utils/setUtils/sets";
import { DatabaseError } from "../errors";

export class PokemonUnit {
  static async getAll(): Promise<IPokemonUnitWithId[]> {
    return await db.getAll("pkmn") as IPokemonUnitWithId[];
  }

  static async getBySpecies(species: SpeciesName): Promise<IPokemonUnitWithId[]> {
    return await db.getAllFromIndex("pkmn", "species", species) as IPokemonUnitWithId[];
  }

  static async getByForm(form: SpeciesName): Promise<IPokemonUnitWithId[]> {
    return await db.getAllFromIndex("pkmn", "form", form) as IPokemonUnitWithId[];
  }

  static async getByPlaythrough(playthrough: string): Promise<IPokemonUnitWithId[]> {
    return await db.getAllFromIndex("pkmn", "playthrough", playthrough) as IPokemonUnitWithId[];
  }

  static async add(pkmn: PokemonSet, playthrough: string) {
    const result = tracePokemon(pkmn.data.species.name);

    if (!result) throw new Error(`Species ${pkmn.species} not found`);

    const [species, form] = result;

    await db.add("pkmn", {
      species,
      form,
      playthrough,
      data: pkmn.pack(),
    });
  }
  
  static async update(id: number, payload: IPokemonUnit) {
    const t = db.transaction("pkmn", "readwrite");

    const old = await t.store.get(id);
    if (!old) throw new DatabaseError("notFound", { store: "pkmn", key: id });
    
    const newFile = Object.assign({}, old, payload);
    await Promise.all([
      t.store.put(newFile),
      t.done,
    ]);
  }
  
  static async updateSet(id: number, payload: Omit<MinimalSet, "species">) {
    const t = db.transaction(["pkmn", "playthrough"], "readwrite");

    const old = await t.objectStore("pkmn").get(id);
    if (!old) throw new DatabaseError("notFound", { store: "pkmn", key: id });

    const playthrough = await t.objectStore("playthrough").get(old.playthrough);
    if (!playthrough) throw new DatabaseError("notFound", { store: "playthrough", key: old.playthrough }, { store: "pkmn", key: id });
  
    const oldSet = Sets.unpackSet(old.data);
    if (!oldSet) throw new Error(`Stored set for Pokémon #${id} is invalid`);
    
    const newSet = Object.assign({}, oldSet, payload);
    
    const newInstance = importFromObject(newSet, playthrough.gen);
  
    await Promise.all([
      t.objectStore("pkmn").put({ ...old, data: newInstance.pack() }),
      t.done,
    ]);

    return newInstance;
  }
}