import { SpeciesName } from "@pkmn/data";
import { db, type IPokemonUnit } from "./db";
import { DatabaseError } from "@/errors";
import { markDBAsStale } from "@/hooks/useDBResource";
import { type PokemonSet, importFromObject } from "@/utils/setUtils";
import { type MinimalSet, Sets } from "@/utils/setUtils/sets";

export class PokemonUnit {
  static async getAll(): Promise<IPokemonUnit[]> {
    return await db.getAll("pkmn") as IPokemonUnit[];
  }

  static async getBySpecies(species: SpeciesName): Promise<IPokemonUnit[]> {
    return await db.getAllFromIndex("pkmn", "species", species) as IPokemonUnit[];
  }

  static async getByForm(form: SpeciesName): Promise<IPokemonUnit[]> {
    return await db.getAllFromIndex("pkmn", "form", form) as IPokemonUnit[];
  }

  static async getByPlaythrough(playthrough: number): Promise<IPokemonUnit[]> {
    return await db.getAllFromIndex("pkmn", "playthrough", playthrough) as IPokemonUnit[];
  }

  static async add(
    pkmn: PokemonSet,
    species: SpeciesName | "",
    form: SpeciesName | "",
    playthrough: number,
  ) {
    const key = await db.add("pkmn", {
      species,
      form,
      playthrough,
      data: pkmn.pack(),
    });

    markDBAsStale("pkmn", { key, species, form, playthrough });
  }
  
  static async update(
    id: number,
    payload: Partial<Omit<IPokemonUnit, "id" | "data">> & { data?: string | MinimalSet },
  ) {
    const t = db.transaction(["pkmn", "playthrough"], "readwrite");

    const old = await t.objectStore("pkmn").get(id);
    if (!old) throw new DatabaseError("notFound", { store: "pkmn", key: "id", value: id });

    const newPayload = { ...payload } as Partial<Omit<IPokemonUnit, "id">>;

    if (typeof payload.data === "object") {
      const playthrough = await t.objectStore("playthrough").get(old.playthrough);
      if (!playthrough) throw new DatabaseError(
        "notFound",
        { store: "playthrough", key: "id", value: old.playthrough },
        { store: "pkmn", key: "id", value: id }
      );
    
      const oldSet = Sets.unpackSet(old.data);
      if (!oldSet) throw new Error(`Stored set for Pokémon #${id} is invalid`);
      
      const newSet = Object.assign({}, oldSet, payload.data);
      
      const newInstance = importFromObject(newSet, playthrough.gen);

      newPayload.data = newInstance.pack();
    }

    const newFile = Object.assign({}, old, newPayload);
    await Promise.all([
      t.objectStore("pkmn").put(newFile),
      t.done,
    ]);

    markDBAsStale("pkmn", {
      key: id,
      species: [old.species, newFile.species],
      form: [old.form, newFile.form],
      playthrough: [old.playthrough, newFile.playthrough],
    });
  }

  static async delete(id: number) {
    const t = db.transaction("pkmn", "readwrite");

    try {
      const pkmn = await t.store.get(id);
      await t.store.delete(id);

      markDBAsStale("pkmn", {
        key: id,
        species: pkmn!.species,
        form: pkmn!.form,
        playthrough: pkmn!.playthrough,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "InvalidStateError") {
        throw new DatabaseError("notFound", { store: "pkmn", key: "id", value: id });
      }
    }
  }
}