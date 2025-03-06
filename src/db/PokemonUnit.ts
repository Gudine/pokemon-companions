import { SpeciesName } from "@pkmn/dex";
import { db, IPokemonUnit } from "./db";
import { tracePokemon } from "../pokemonList";
import { PartialPkmnSet, SetUtils } from "../utils/setUtils";

export class PokemonUnit {
  static async getBySpecies(species: SpeciesName): Promise<IPokemonUnit[]> {
    return await db.getAllFromIndex("pkmn", "species", species);
  }

  static async getByForm(form: SpeciesName): Promise<IPokemonUnit[]> {
    return await db.getAllFromIndex("pkmn", "form", form);
  }

  static async getByPlaythrough(playthrough: string): Promise<IPokemonUnit[]> {
    return await db.getAllFromIndex("pkmn", "playthrough", playthrough);
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