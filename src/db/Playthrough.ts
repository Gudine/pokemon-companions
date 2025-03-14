import { GenerationNum } from "@pkmn/data";
import { db, IPlaythrough } from "./db";
import { DatabaseError } from "../errors";
import { markDBAsStale } from "../hooks/useDBResource";

export class Playthrough {
  static async getAll(): Promise<IPlaythrough[]> {
    return (await db.getAll("playthrough")).sort((a, b) => b.date.valueOf() - a.date.valueOf());
  }

  static async getByName(name: string): Promise<IPlaythrough | undefined> {
    return await db.get("playthrough", name);
  }

  static async add(name: string, date: Date, gen: GenerationNum) {
    try {
      await db.add("playthrough", {
        name,
        date,
        gen,
      });
      
      markDBAsStale("playthrough", { key: name, date });
    } catch (err) {
      if (err instanceof DOMException && err.name === "ConstraintError") {
        throw new DatabaseError("alreadyExists", { store: "playthrough", key: name });
      }
    }
  }

  static async update(name: string, payload: Omit<IPlaythrough, "name">) {
    const t = db.transaction("playthrough", "readwrite");

    const old = await t.store.get(name);
    if (!old) throw new DatabaseError("notFound", { store: "playthrough", key: name });
    
    const newFile = Object.assign({}, old, payload);
    await Promise.all([
      t.store.put(newFile),
      t.done,
    ]);
      
    markDBAsStale("playthrough", { key: name, date: [old.date, newFile.date] });
  }

  static async delete(name: string) {
    const t = db.transaction("playthrough", "readwrite");

    try {
      const playthrough = await t.store.get(name);
      await t.store.delete(name);
      
      markDBAsStale("playthrough", { key: name, date: playthrough!.date });
    } catch (err) {
      if (err instanceof DOMException && err.name === "InvalidStateError") {
        throw new DatabaseError("notFound", { store: "playthrough", key: name });
      }
    }
  }
}