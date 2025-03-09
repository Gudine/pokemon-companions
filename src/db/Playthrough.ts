import { GenerationNum } from "@pkmn/data";
import { db, IPlaythrough } from "./db";

export class Playthrough {
  static async getAll(): Promise<IPlaythrough[]> {
    return (await db.getAll("playthrough")).sort((a, b) => b.date.valueOf() - a.date.valueOf());
  }

  static async getByName(name: string): Promise<IPlaythrough | undefined> {
    return await db.get("playthrough", name);
  }

  static async add(name: string, date: Date, gen: GenerationNum) {
    await db.add("playthrough", {
      name,
      date,
      gen,
    });
  }
}