import { GenerationNum } from "@pkmn/data";
import { db, IPlaythrough } from "./db";
import { DatabaseError } from "../errors";

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
    } catch (err) {
      if (err instanceof DOMException && err.name === "ConstraintError") {
        throw new DatabaseError("alreadyExists", { store: "playthrough", key: name });
      }
    }
  }
}