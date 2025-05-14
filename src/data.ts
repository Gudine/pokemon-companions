import { type Data, Generations } from "@pkmn/data";
import { Dex } from "@pkmn/dex";

function existsFn(d: Data) {
  if (!d.exists) return false;
  if (d.kind === "Ability" && d.id === "noability") return false;
  if (
    'isNonstandard' in d
    && d.isNonstandard
    && d.isNonstandard !== "Past"
    && d.isNonstandard !== "Unobtainable"
  ) return false;
  if (d.kind === "Species" && (d.battleOnly || d.forme === "Gmax")) return false;
  
  return true;
}

export const gens = new Generations(Dex, existsFn);
export const defaultGen = gens.get(9);
