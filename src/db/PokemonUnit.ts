import { SpeciesName } from "@pkmn/data";
import { db, IPokemonUnitWithId } from "./db";
import { tracePokemon } from "../utils/pkmnUtils";
import { PartialPkmnSet, SetUtils } from "../utils/setUtils";

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

  static async add(pkmn: PartialPkmnSet, playthrough: string) {
    const result = pkmn.species && tracePokemon(pkmn.species as SpeciesName);

    if (!result) throw new Error(`Species ${pkmn.species} not found`);

    const [species, form] = result;

    await db.add("pkmn", {
      species,
      form,
      playthrough,
      data: SetUtils.packSet(pkmn),
    });
  }
}