import type { StoreNames, StoreKey } from "idb";
import type { PokemonDB } from "./db/db";

type ErrorDBEntityType<T extends StoreNames<PokemonDB>> = {
  store: T;
  key: StoreKey<PokemonDB, T>
}

const typeDisplay: Record<"notFound" | "alreadyExists", string> = {
  notFound: "not found",
  alreadyExists: "already exists",
}

const storeDisplay: {
  [Key in StoreNames<PokemonDB>]: (id: StoreKey<PokemonDB, Key>) => string
} = {
  pkmn: (id) => `Pokémon #${id}`,
  playthrough: (id) => `Playthrough "${id}"`,
}

export class DatabaseError<
  MainStore extends StoreNames<PokemonDB>,
  RefStore extends StoreNames<PokemonDB>
> extends Error {
  constructor(
    public type: "notFound" | "alreadyExists",
    public main: ErrorDBEntityType<MainStore>,
    public reference?: ErrorDBEntityType<RefStore>,
    message?: string,
  ) {
    let finalMessage: string;

    if (message) finalMessage = message;
    else {
      finalMessage = storeDisplay[main.store](main.key);
      if (reference) finalMessage += ` associated with ${storeDisplay[reference.store](reference.key)}`;
      finalMessage += " " + typeDisplay[type];
    }

    super(finalMessage);

    this.name = "DatabaseError";
  }
}
