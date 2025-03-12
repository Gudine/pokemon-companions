import type { Ability, GenderName, Generation, GenerationNum, ID, Item, Move, Nature, Specie, StatsTable } from '@pkmn/data';
import { gens } from '../../data';
import { MinimalSet, Sets } from './sets';
import { SetValidationError } from '../../errors';

type UpToFour<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T];

export class PokemonSetGen1 {
  // * Required: Yes
  get species() { return this.data.species.id }

  // * Required: Yes
  level: number;

  // * Required: No
  // * If not required, defaults to: undefined
  // * If undefined, is treated as: Species name
  name?: string;

  // * Available since: Gen 1
  // * Required: No
  // * If not required, defaults to: 0 for every stat
  evs: StatsTable;

  // * Available since: Gen 1
  // * Required: No
  // * If not required, defaults to: 31 for every stat
  ivs: StatsTable;

  // * Available since: Gen 1
  // * Required: Yes (at least one, at most four)
  get moves() {
    return this.data.moves.map((move) => move.id === "hiddenpower"
      ? `hiddenpower${move.type.toLowerCase()}` as ID
      : move.id) satisfies ID[] as UpToFour<ID>;
  }

  data: {
    main: Generation,
    species: Specie,
    moves: UpToFour<Move>,
  }

  protected constructor(set: MinimalSet, gen: GenerationNum) {
    const data = gens.get(gen);

    if (!set.species) throw new SetValidationError("species", set.species);
    const speciesData = data.species.get(set.species);
    if (!speciesData)  throw new SetValidationError("species", set.species);

    if (set.level == null) throw new SetValidationError("level", set.level);
    if (!set.moves?.length || set.moves.length > 4) throw new SetValidationError("moves", set.moves, "Pokémon should have 1-4 moves");

    const movesData = set.moves.map((move) => {
      const moveData = data.moves.get(move);
      if (!moveData) throw new SetValidationError("move", move);
      return moveData;
    }) satisfies Move[] as UpToFour<Move>;

    this.data = {
      main: data,
      species: speciesData,
      moves: movesData,
    };

    this.level = set.level;
    this.name = (!set.name || set.name === speciesData.name || set.name === this.species) ? undefined : set.name;

    this.evs = data.stats.fill(set.evs ?? {}, 0);
    this.ivs = data.stats.fill(set.ivs ?? {}, 31);
  }

  pack() {
    return Sets.packSet(this);
  }

  export() {
    return Sets.exportSet(this);
  }

  static create(set: MinimalSet) { return new this(set, 1) }
  
  isGen<T extends GenerationNum>(min: T): this is PokemonSets[T] { return min <= 1; }
}

export class PokemonSetGen2 extends PokemonSetGen1 {
  // * Required: Yes (if on a species with gender options)
  //   * Must be absent if on a genderless species
  // * If not required, defaults to: Species' gender (undefined if genderless)
  gender?: GenderName;

  // * Required: No
  // * If not required, defaults to: false
  shiny: boolean;

  // * Required: No
  // * If not required, defaults to: undefined
  // * If undefined, is treated as: "No item"
  get item() { return this.data.item?.id; }

  // * Required: No
  // * If not required, defaults to: undefined
  // * If undefined, is treated as: "Unspecified"
  happiness?: number;

  declare data: PokemonSetGen1["data"] & {
    item?: Item,
  }

  protected constructor(set: MinimalSet, gen: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    super(set, gen);

    const speciesData = this.data.main.species.get(this.species)!;

    if (!speciesData.gender && !set.gender) throw new SetValidationError("gender", set.gender, `Gender must be specified for species "${speciesData.name}"`);
    if (set.gender && set.gender !== "M" && set.gender !== "F") throw new SetValidationError("gender", set.gender);
    if (set.gender && speciesData.gender && set.gender !== speciesData.gender) {
      throw new SetValidationError("gender", set.gender, `Gender "${set.gender}" not allowed for species "${speciesData.name}"`);
    }
    // speciesData.gender = "M" | "F" | "N"; set.gender = undefined
    // speciesData.gender = undefined; set.gender = "M" | "F"
    // <T extends "M" | "F"> speciesData.gender = T; set.gender = T

    this.gender = speciesData.gender === "N"
      ? undefined
      : (set.gender as "M" | "F") || speciesData.gender;
    
    this.shiny = !!set.shiny;

    const itemData = set.item && this.data.main.items.get(set.item) || undefined;
    const item = itemData?.id;
    if (set.item && !item) throw new SetValidationError("item", set.item);

    this.data.item = itemData;

    this.happiness = set.happiness;
  }

  static create(set: MinimalSet) { return new this(set, 2) }

  override isGen<T extends GenerationNum>(min: T): this is PokemonSets[T] { return min <= 2 }
}

export class PokemonSetGen3 extends PokemonSetGen2 {
  // * Required: No
  // * If not required, defaults to: First ability
  get ability() { return this.data.ability.id }
  
  // * Required: No
  // * If not required, defaults to: undefined
  // * If undefined, is treated as: "Unspecified"
  get pokeball() { return this.data.pokeball?.id }
  
  // * Required: No
  // * If not required, defaults to: undefined
  // * If undefined, is treated as: "Unspecified" | "Serious" for stat calculations
  get nature() { return this.data.nature?.id }

  declare data: PokemonSetGen2["data"] & {
    ability: Ability,
    pokeball?: Item,
    nature?: Nature,
  }

  protected constructor(set: MinimalSet, gen: 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    super(set, gen);

    const speciesData = this.data.main.species.get(this.species)!;

    const abilityData = this.data.main.abilities.get(set.ability || speciesData.abilities[0]);
    if (!abilityData) throw new SetValidationError("ability", set.ability);
    
    this.data.ability = abilityData;
    this.data.pokeball = set.pokeball && this.data.main.items.get(set.pokeball) || undefined;
    this.data.nature = set.nature && this.data.main.natures.get(set.nature) || undefined;
  }

  static create(set: MinimalSet, gen?: 3 | 4 | 5 | 6) { return new this(set, gen ?? 3) }
  
  override isGen<T extends GenerationNum>(min: T): this is PokemonSets[T] { return min <= 3 }
}

export class PokemonSetGen7 extends PokemonSetGen3 {
  // * Required: No (can only be set if Hidden Power is not on the moveset)
  // * If not required, defaults to: undefined
  // * If undefined, is treated as: See above || "Unspecified"
  hpType?: ID;

  protected constructor(set: MinimalSet, gen: 7 | 8 | 9) {
    super(set, gen);

    const hiddenPower = this.moves.find((move) => move.startsWith("hiddenpower"));
    const hpCalc = this.data.main.types.get(this.data.main.types.getHiddenPower(this.ivs).type)!.id;
    const hpTypeId = set.hpType === undefined ? undefined : this.data.main.types.get(set.hpType)?.id;
    
    this.hpType = (!hiddenPower && hpTypeId && hpTypeId !== hpCalc) ? hpTypeId : undefined;
  }

  static create(set: MinimalSet) { return new this(set, 7) }

  override isGen<T extends GenerationNum>(min: T): this is PokemonSets[T] { return min <= 7 }
}

export class PokemonSetGen8 extends PokemonSetGen7 {
  // * Required: No
  // * If not required, defaults to: false
  gigantamax: boolean;

  // * Required: No
  // * If not required, defaults to: undefined
  // * If undefined, is treated as: "Unspecified"
  dynamaxLevel?: number;

  protected constructor(set: MinimalSet, gen: 8 | 9) {
    super(set, gen);

    this.gigantamax = !!set.gigantamax;
    this.dynamaxLevel = set.dynamaxLevel;
  }

  static create(set: MinimalSet) { return new this(set, 8) }
  
  override isGen<T extends GenerationNum>(min: T): this is PokemonSets[T] { return min <= 8 }
}

export class PokemonSetGen9 extends PokemonSetGen8 {
  // * Required: No
  // * If not required, defaults to: undefined
  // * If undefined, is treated as: "Unspecified"
  teraType?: ID;

  protected constructor(set: MinimalSet, gen: 9) {
    super(set, gen);
    
    this.teraType = set.teraType && this.data.main.types.get(set.teraType)?.id || undefined;
  }

  static create(set: MinimalSet) { return new this(set, 9) }
  
  override isGen<T extends GenerationNum>(min: T): this is PokemonSets[T] { return min <= 9 }
}

export type PokemonSets = {
  1: PokemonSetGen1,
  2: PokemonSetGen2,
  3: PokemonSetGen3,
  4: PokemonSetGen3,
  5: PokemonSetGen3,
  6: PokemonSetGen3,
  7: PokemonSetGen7,
  8: PokemonSetGen8,
  9: PokemonSetGen9,
};

export type PokemonSet = PokemonSets[keyof PokemonSets];