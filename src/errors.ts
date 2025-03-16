import type { StoreNames, StoreKey, IndexNames, IndexKey } from "idb";
import type { PokemonDB } from "./db/db";

const capitalize = (str: string) => str && str[0].toUpperCase() + str.slice(1);

export class SetValidationError extends Error {
  constructor(public field: string, public value?: any, message?: string) {
    const finalMessage = message ?? ((value == null || value === "")
      ? `${capitalize(field)} not specified`
      : `Invalid ${field} "${value}"`);

    super(finalMessage);

    this.name = "SetValidationError";
  }
}

type PropertyMap<T extends StoreNames<PokemonDB>> = {
  [Key in IndexNames<PokemonDB, T>]: IndexKey<PokemonDB, T, Key>;
} & {
  id: StoreKey<PokemonDB, T>;
}

type ErrorDBEntityType<
  T extends StoreNames<PokemonDB>,
  U extends IndexNames<PokemonDB, T> | "id", // Probably shouldn't hardcode this "id", but...
> = {
  store: T;
  key: U;
  value: PropertyMap<T>[U];
}

const typeDisplay: Record<"notFound" | "alreadyExists", string> = {
  notFound: "not found",
  alreadyExists: "already exists",
}

const storeDisplay: { [key: string]: (key: string, value: any) => string } = {
  pkmn: (key, value) => `Pokémon of ${key} "${value}"`,
  playthrough: (key, value) => `Playthrough of ${key} "${value}"`,
}

export class DatabaseError<
  MainStore extends StoreNames<PokemonDB>,
  MainIndex extends IndexNames<PokemonDB, MainStore> | "id",
  RefStore extends StoreNames<PokemonDB>,
  RefIndex extends IndexNames<PokemonDB, MainStore> | "id",
> extends Error {
  constructor(
    public type: "notFound" | "alreadyExists",
    public main: ErrorDBEntityType<MainStore, MainIndex>,
    public ref?: ErrorDBEntityType<RefStore, RefIndex>,
    message?: string,
  ) {
    let finalMessage: string;

    if (message) finalMessage = message;
    else {
      finalMessage = storeDisplay[main.store](main.key, main.value);
      if (ref) finalMessage += `, associated with ${storeDisplay[ref.store](ref.key, ref.value)}`;
      finalMessage += " " + typeDisplay[type];
    }

    super(finalMessage);

    this.name = "DatabaseError";
  }
}
