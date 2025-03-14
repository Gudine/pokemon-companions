import { type MinimalSet, Sets } from './sets';
import {
  PokemonSetGen1, PokemonSetGen2, PokemonSetGen3,
  PokemonSetGen7, PokemonSetGen8, PokemonSetGen9,
  type PokemonSets,
} from "./classes";
import { SetValidationError } from '@/errors';

const pokemonSets: { [Key in keyof PokemonSets]: (set: MinimalSet) => PokemonSets[Key] } = {
  1: (set) => PokemonSetGen1.create(set),
  2: (set) => PokemonSetGen2.create(set),
  3: (set) => PokemonSetGen3.create(set, 3),
  4: (set) => PokemonSetGen3.create(set, 4),
  5: (set) => PokemonSetGen3.create(set, 5),
  6: (set) => PokemonSetGen3.create(set, 6),
  7: (set) => PokemonSetGen7.create(set),
  8: (set) => PokemonSetGen8.create(set),
  9: (set) => PokemonSetGen9.create(set),
};

export function importFromObject<T extends keyof PokemonSets>(set: MinimalSet, gen: T): PokemonSets[T] {
  return pokemonSets[gen](set) as PokemonSets[T];
}

export function unpackSet<T extends keyof PokemonSets>(buf: string, gen: T) {
  const unpacked = Sets.unpackSet(buf);

  try {
    return unpacked && importFromObject(unpacked, gen);
  } catch {
    return undefined;
  }
}

export function importSet<T extends keyof PokemonSets>(buf: string, gen: T) {
  const imported = Sets.importSet(buf);

  try {
    return imported && importFromObject(imported, gen);
  } catch {
    return undefined;
  }
}

export function importSetWithErrors<T extends keyof PokemonSets>(buf: string, gen: T) {
  const imported = Sets.importSet(buf);

  if (!imported) throw new SetValidationError("", undefined, "Invalid data");

  return importFromObject(imported, gen);
}

export type {
  PokemonSetGen1, PokemonSetGen2, PokemonSetGen3,
  PokemonSetGen7, PokemonSetGen8, PokemonSetGen9,
  PokemonSet, PokemonSets,
} from "./classes";
