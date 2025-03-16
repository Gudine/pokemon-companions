import type { GenerationNum } from "@pkmn/data";
import { db, type IPlaythrough } from "./db";
import { DatabaseError } from "@/errors";
import { markDBAsStale } from "@/hooks/useDBResource";

export class Playthrough {
  static async getAll(): Promise<IPlaythrough[]> {
    return (await db.getAll("playthrough") as IPlaythrough[])
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());
  }

  static async getByName(name: string): Promise<IPlaythrough | undefined> {
    return await db.getFromIndex("playthrough", "name", name) as IPlaythrough | undefined;
  }

  static async add(name: string, date: Date, gen: GenerationNum) {
    const key = await db.add("playthrough", {
      name,
      date,
      gen,
    });
    
    markDBAsStale("playthrough", { key, name, date });
  }

  static async update(id: number, payload: Partial<Omit<IPlaythrough, "id">>) {
    const t = db.transaction("playthrough", "readwrite");

    const old = await t.store.get(id);
    if (!old) throw new DatabaseError("notFound", {
      store: "playthrough",
      key: "id",
      value: id,
    });
    
    const newFile = Object.assign({}, old, payload);
    await Promise.all([
      t.store.put(newFile),
      t.done,
    ]);
      
    markDBAsStale("playthrough", {
      key: id,
      name: [old.name, newFile.name],
      date: [old.date, newFile.date],
    });
  }

  static async delete(id: number) {
    const t = db.transaction("playthrough", "readwrite");

    try {
      const playthrough = await t.store.get(id);
      await t.store.delete(id);
      
      markDBAsStale("playthrough", {
        key: id,
        name: playthrough!.name,
        date: playthrough!.date
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "InvalidStateError") {
        throw new DatabaseError("notFound", { store: "playthrough", key: "id", value: id });
      }
    }
  }
}