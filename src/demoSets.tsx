import { SpeciesName } from "@pkmn/data";
import { defaultGen } from "./data";
import { PkmnSet } from "./utils/setUtils";

function randomFrom<T extends unknown>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const allMoves = [...defaultGen.moves].map((m) => m.name);

const allItems = [...defaultGen.items].map((item) => item.name);

export function generatePokemon(species: SpeciesName): PkmnSet {
  const pkmn = defaultGen.species.get(species)!;

  const elligibleAbilities = [pkmn.abilities[0], pkmn.abilities[1], pkmn.abilities.H, pkmn.abilities.S]
    .filter(x => x != null);

  return {
    name: "Henry",
    species,
    item: randomFrom(allItems),
    ability: randomFrom(elligibleAbilities),
    moves: Array(1 + Math.floor(Math.random() * 4)).fill(null).map(() => randomFrom(allMoves)),
    nature: "Hasty",
    gender: pkmn.gender ?? randomFrom(["M", "F"]),
    evs: {
      hp: 0,
      atk: 0,
      def: 0,
      spa: 0,
      spd: 0,
      spe: 0,
    },
    ivs: {
      hp: 0,
      atk: 0,
      def: 0,
      spa: 0,
      spd: 0,
      spe: 0,
    },
    level: 50 + Math.floor(Math.random() * 51),
    shiny: randomFrom([true, false]),
    // happiness?: number,
    // pokeball?: T,
    // hpType?: string,
    // dynamaxLevel?: number,
    // gigantamax?: boolean,
    // teraType?: string,
  }
}