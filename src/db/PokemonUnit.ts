import { SpeciesName } from "@pkmn/data";
import { db, type IPokemonUnitWithId, type IPokemonUnit } from "./db";
import { tracePokemon } from "../utils/pkmnUtils";
import { type PokemonSet } from "../utils/setUtils";
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
}