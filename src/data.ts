import { Data, Generations } from "@pkmn/data";
import { Dex } from "@pkmn/dex";

export function isFinalStage(pkmn: Data & { kind: "Species" }) {
  const evos = pkmn.evos
    ?.map((evo) => Dex.species.get(evo))
    .filter((evo) => evo.gen <= pkmn.gen);
  
  if (!evos?.length) return true;

  if (pkmn.gender) return false;

  return (
    evos.every((evo) => evo.gender)
    && new Set(evos.map((evo) => evo.gender)).size === 1
  );
}

function existsFn(d: Data) {
  if (!d.exists) return false;
  if (d.kind === "Ability" && d.id === "noability") return false;
  if ('isNonstandard' in d && d.isNonstandard && d.isNonstandard !== "Past") return false;
  if (d.kind === "Species" && (!isFinalStage(d) || d.battleOnly || d.forme === "Gmax")) return false;
  
  return true;
}

export const gens = new Generations(Dex, existsFn);
export const defaultGen = gens.get(9);
