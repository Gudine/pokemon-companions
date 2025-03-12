import type { Generation } from '@pkmn/data';
import { Sets, type MinimalSet } from './sets';

export type PartialPkmnSet = Required<Pick<MinimalSet, "species" | "moves">> & Omit<MinimalSet, "species" | "moves">;

export const SetUtils = new class {
  isMinimum(set?: MinimalSet): set is PartialPkmnSet {
    return Boolean(set && set.species && set.moves?.length);
  }

  packSet(s: PartialPkmnSet): string {
    return Sets.packSet(s);
  }

  unpackSet(buf: string, data?: Generation): PartialPkmnSet | undefined {
    const unpacked = Sets.unpackSet(buf);
    if (!this.isMinimum(unpacked)) return;

    if (data) {
      const species = data.species.get(unpacked.species);
      if (!species) return;
    }

    return unpacked;
  }

  exportSet(s: PartialPkmnSet): string {
    return Sets.exportSet(s);
  }

  importSet(buf: string, data?: Generation): PartialPkmnSet | undefined {
    const imported = Sets.importSet(buf);
    if (!this.isMinimum(imported)) return;

    if (data) {
      const species = data.species.get(imported.species);
      if (!species) return;
    }

    return imported;
  }
}