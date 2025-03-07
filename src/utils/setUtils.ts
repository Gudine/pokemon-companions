import type { Generation } from '@pkmn/data';
import { Sets, type PokemonSet } from '@pkmn/sets';

export type PkmnSet<T = string> = Omit<PokemonSet<T>, "gender" | "level"> & Partial<Pick<PokemonSet<T>, "gender" | "level">>;
export type PartialPkmnSet<T = string> = Pick<PkmnSet<T>, "species" | "moves"> & Partial<Omit<PkmnSet<T>, "species" | "moves">>;

export const SetUtils = new class {
  isMinimum(set?: Partial<PkmnSet>): set is PartialPkmnSet {
    return Boolean(set && set.species && set.moves?.length);
  }

  packSet(s: PartialPkmnSet): string {
    return Sets.packSet(s);
  }

  unpackSet(buf: string, data?: Generation): PkmnSet<string> | undefined {
    const unpacked = Sets.unpackSet(buf, data?.dex);
    if (!this.isMinimum(unpacked)) return;

    if (data) {
      const species = data.species.get(unpacked.species);
      if (!species) return;
    }

    return unpacked;
  }

  exportSet(s: PartialPkmnSet, data?: Generation): string {
    return Sets.exportSet(s, data?.dex);
  }

  importSet(buf: string, data?: Generation): PartialPkmnSet<string> | undefined {
    const imported = Sets.importSet(buf, data?.dex);
    if (!this.isMinimum(imported)) return;

    if (data) {
      const species = data.species.get(imported.species);
      if (!species) return;
    }

    return imported;
  }

  toJSON(s: PartialPkmnSet): string {
    return JSON.stringify(s);
  }

  fromJSON(json: string): PartialPkmnSet<string> | undefined {
    try {
      const imported = Sets.fromJSON(json);

      return this.isMinimum(imported) ? imported : undefined;
    } catch {
      return undefined;
    }
  }
}