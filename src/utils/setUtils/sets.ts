import { PokemonSet, StatID, StatsTable } from "@pkmn/data";

type DeepPartial<T> = T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type MinimalSet = DeepPartial<PokemonSet>;

type InputType = string | number | undefined;

function packName(name: string | number | undefined) {
  const nameStr = typeof name === "number" ? String(name) : name;
  if (!nameStr) return '';
  return nameStr.replace(/[,\][|]+/g, '');
}

const UNPACK_REGEX = new RegExp([
  /^([^|]+)/,
  /\|([^|]+)?/,
  /\|([^|]+)?/,
  /\|([^|]+)?/,
  /\|(?:([^|,]+)(?:,([^|,]+))?(?:,([^|,]+))?(?:,([^|,]+))?)?/,
  /\|([^|]+)?/,
  /\|(?:(\d+)?,(\d+)?,(\d+)?,(\d+)?,(\d+)?,(\d+)?)?/,
  /\|([^|]+)?/,
  /\|(?:(\d+)?,(\d+)?,(\d+)?,(\d+)?,(\d+)?,(\d+)?)?/,
  /\|(S)?/,
  /\|(\d+)?/,
  /\|(?:(\d+)?(?:,([^|,]+)?(?:,([^|,]+)?(?:,(G)?(?:,(\d+)?(?:,([^|,]+)?)?)?)?)?)?)?$/
].map(x => x.source).join(""));

type RegexMatches = RegExpMatchArray & [
  string,
  
  nickname: string,
  species: string | undefined,
  item: string | undefined,
  ability: string | undefined,

  move1: string | undefined,
  move2: string | undefined,
  move3: string | undefined,
  move4: string | undefined,

  nature: string | undefined,

  evHp: string | undefined,
  evAtk: string | undefined,
  evDef: string | undefined,
  evSpA: string | undefined,
  evSpD: string | undefined,
  evSpe: string | undefined,

  gender: string | undefined,

  ivHp: string | undefined,
  ivAtk: string | undefined,
  ivDef: string | undefined,
  ivSpA: string | undefined,
  ivSpD: string | undefined,
  ivSpe: string | undefined,

  shiny: string | undefined,
  level: string | undefined,

  happiness: string | undefined,
  hpType: string | undefined,
  pokeball: string | undefined,
  gigantamax: string | undefined,
  dynamaxLevel: string | undefined,
  teraType: string | undefined,
];

const STAT_NAMES: Readonly<StatsTable<string>> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

const STATS = Object.keys(STAT_NAMES) as readonly StatID[];

const INTRO_REGEX = /^(.+?)(?: \(([^)]+)\))??(?: \((M|F)\))?(?: @ (.+))?$/;
type IntroRegexMatches = RegExpMatchArray & [
  string,
  nickname: string,
  species: string | undefined,
  gender: string | undefined,
  item: string | undefined,
];

const NATURE_REGEX = /^([a-z]+) nature$/i;
const STAT_REGEX = /^(\d+) ([A-Za-z ]+)$/;
const NUM_REGEX = /^\d+$/;
const HIDDEN_POWER_REGEX = /^Hidden Power ([A-Za-z]+)$/;

const DECODE_STAT: Readonly<{[name: string]: StatID}> = {
  HP: 'hp', hp: 'hp',
  Attack: 'atk', Atk: 'atk', atk: 'atk',
  Defense: 'def', Def: 'def', def: 'def',
  'Special Attack': 'spa', SpA: 'spa', SAtk: 'spa', SpAtk: 'spa', spa: 'spa',
  Special: 'spa', spc: 'spa', Spc: 'spa',
  'Special Defense': 'spd', SpD: 'spd', SDef: 'spd', SpDef: 'spd', spd: 'spd',
  Speed: 'spe', Spe: 'spe', Spd: 'spe', spe: 'spe',
};

export const Sets = new class {
  packSet(s: DeepPartial<PokemonSet>) {
    const fields: (InputType | InputType[])[] = [];
  
    // fields.push(s.name || s.species);
    fields.push(s.name ? s.species : undefined);
    fields.push(s.item);
    fields.push(s.ability);
    
    fields.push(s.moves?.map(packName));
    
    fields.push(s.nature);
  
    const evs = [s.evs?.hp, s.evs?.atk, s.evs?.def, s.evs?.spa, s.evs?.spd, s.evs?.spe];
    fields.push(evs.some((ev) => ev !== undefined) ? evs : "");
  
    fields.push(s.gender);
  
    const ivs = [s.ivs?.hp, s.ivs?.atk, s.ivs?.def, s.ivs?.spa, s.ivs?.spd, s.ivs?.spe];
    fields.push(ivs.some((iv) => iv !== undefined) ? ivs : "");
  
    fields.push(s.shiny ? "S" : "");
    fields.push(s.level);
    fields.push(s.happiness);
    
    const start = `${s.name || s.species || ""}|`;
    
    const middle = fields.map((field) => Array.isArray(field)
      ? field.map((f) => packName(f)).join(",")
      : packName(field)).join("|");
    
    const extras = [s.hpType, s.pokeball, s.gigantamax ? "G" : undefined, s.dynamaxLevel, s.teraType];
    const end = extras.some((extra) => extra !== undefined)
      ? "," + extras.map((f) => packName(f)).join(",")
      : "";
  
    return start + middle + end;
  }
  
  unpackSet(buf: string): DeepPartial<PokemonSet> | undefined {
    const groups = buf.match(UNPACK_REGEX) as RegexMatches | null;
    if (!groups) return;
    
    const set: DeepPartial<PokemonSet> = {};
    
    if (groups[1] && groups[2]) set.name = groups[1];
    if (groups[2] || groups[1]) set.species = groups[2] || groups[1];
    if (groups[3]) set.item = groups[3];
    if (groups[4] && groups[4] !== "-") set.ability = groups[4];
    if (groups[16]) set.gender = groups[16];
    if (groups[9]) set.nature = groups[9];
  
    if (groups[24]) set.level = Number(groups[24]);
    if (groups[23]?.toLowerCase() === "s") set.shiny = true;
    if (groups[25]) set.happiness = Number(groups[25]);
    if (groups[27]) set.pokeball = groups[27];
    if (groups[26]) set.hpType = groups[26];
    if (groups[29]) set.dynamaxLevel = Number(groups[29]);
    if (groups[28]?.toLowerCase() === "g") set.gigantamax = true;
    if (groups[30]) set.teraType = groups[30];
  
    if (groups[10] || groups[11] || groups[12] || groups[13] || groups[14] || groups[15]) {
      set.evs = {};
  
      if (groups[10]) set.evs.hp = Number(groups[10]);
      if (groups[11]) set.evs.atk = Number(groups[11]);
      if (groups[12]) set.evs.def = Number(groups[12]);
      if (groups[13]) set.evs.spa = Number(groups[13]);
      if (groups[14]) set.evs.spd = Number(groups[14]);
      if (groups[15]) set.evs.spe = Number(groups[15]);
    }
  
    if (groups[17] || groups[18] || groups[19] || groups[20] || groups[21] || groups[22]) {
      set.ivs = {};
  
      if (groups[17]) set.ivs.hp = Number(groups[17]);
      if (groups[18]) set.ivs.atk = Number(groups[18]);
      if (groups[19]) set.ivs.def = Number(groups[19]);
      if (groups[20]) set.ivs.spa = Number(groups[20]);
      if (groups[21]) set.ivs.spd = Number(groups[21]);
      if (groups[22]) set.ivs.spe = Number(groups[22]);
    }
    
    set.moves = [groups[5], groups[6], groups[7], groups[8]]
      .filter((x) => x !== undefined)
      .map((move) => move.replace(HIDDEN_POWER_REGEX, "Hidden Power [$1]"));
    
    return set;
  }
  
  exportSet(s: DeepPartial<PokemonSet>): string {
    let buf = ""
  
    buf += s.name || s.species || "";
    if (s.name) buf += " (" + (s.species || "") + ")";
    if (s.gender === "M" || s.gender === "F") buf += " (" + s.gender + ")";
    if (s.item) buf += " @ " + s.item;
    
    if (s.ability) buf += "\nAbility: " + s.ability;
    if (s.level !== undefined) buf += "\nLevel: " + s.level;
    if (s.shiny) buf += "\nShiny: Yes";
    if (s.happiness !== undefined) buf += "\nHappiness: " + s.happiness;
    if (s.pokeball) buf += "\nPokeball: " + s.pokeball;
    if (s.hpType) buf += "\nHidden Power: " + s.hpType;
    if (s.dynamaxLevel !== undefined) buf += "\nDynamax Level: " + s.dynamaxLevel;
    if (s.gigantamax) buf += "\nGigantamax: Yes";
    if (s.teraType) buf += "\nTera Type: " + s.teraType;
  
    if (s.evs && Object.values(s.evs).some((v) => v !== undefined)) {
      buf += "\nEVs: ";
  
      let first = true;
  
      for (const stat of STATS) {
        if (s.evs[stat] !== undefined) {
          buf += (!first ? " / " : "") + s.evs![stat] + " " + STAT_NAMES[stat];
          first = false;
        }
      }
    }
  
    if (s.nature) buf += "\n" + s.nature + " Nature";
  
    if (s.ivs && Object.values(s.ivs).some((v) => v !== undefined)) {
      buf += "\nIVs: ";
  
      let first = true;
  
      for (const stat of STATS) {
        if (s.ivs[stat] !== undefined) {
          buf += (!first ? " / " : "") + s.ivs![stat] + " " + STAT_NAMES[stat];
          first = false;
        }
      }
    }
  
    if (s.moves) for (const move of s.moves) {
      buf += "\n- " + move;
    };
  
    return buf;
  }
  
  importSet(buf: string) {
    const set: DeepPartial<PokemonSet> = {};

    for (const rawLine of buf.split("\n")) {
      const line = rawLine.trim();

      if ((line === '' || line === '---' || line.startsWith('===') || line.includes('|'))) {
        if (!set.species) return;
        return set;
      }

      if (!set.species) {
        const slateGroups = line.match(INTRO_REGEX) as IntroRegexMatches | undefined;
    
        if (slateGroups) {
          if (slateGroups[1] && slateGroups[2]) set.name = slateGroups[1];
          if (slateGroups[2] || slateGroups[1]) set.species = slateGroups[2] || slateGroups[1];
          if (slateGroups[3]) set.gender = slateGroups[3];
          if (slateGroups[4]) set.item = slateGroups[4];
    
          continue;
        }
      }
      
      if (line.startsWith("Ability: ")) set.ability = line.slice(9);
      else if (line.startsWith("Trait: ")) set.ability = line.slice(7);
      else if (line === "Shiny: Yes") set.shiny = true;
      else if (line.startsWith("Level: ")) {
        if (NUM_REGEX.test(line.slice(7))) set.level = Number(line.slice(7));
      }
      else if (line.startsWith("Happiness: ")) {
        if (NUM_REGEX.test(line.slice(11))) set.happiness = Number(line.slice(11));
      }
      else if (line.startsWith("Pokeball: ")) set.pokeball = line.slice(10);
      else if (line.startsWith("Hidden Power: ")) set.hpType = line.slice(14);
      else if (line.startsWith("Tera Type: ")) set.teraType = line.slice(11);
      else if (line.startsWith("Dynamax Level: ")) {
        if (NUM_REGEX.test(line.slice(15))) set.dynamaxLevel = Number(line.slice(15));
      }
      else if (line === "Gigantamax: Yes") set.gigantamax = true;
      
      else if (line.startsWith("EVs: ")) {
        set.evs = {};

        for (const evLine of line.slice(5).split(" / ")) {
          const statMatch = evLine.match(STAT_REGEX);
          if (!statMatch || !(statMatch[2] in DECODE_STAT)) continue;

          set.evs[DECODE_STAT[statMatch[2]]] = Number(statMatch[1]);
        }
      } else if (line.startsWith("IVs: ")) {
        set.ivs = {};

        for (const ivLine of line.slice(5).split(" / ")) {
          const statMatch = ivLine.match(STAT_REGEX);
          if (!statMatch || !(statMatch[2] in DECODE_STAT)) continue;

          set.ivs[DECODE_STAT[statMatch[2]]] = Number(statMatch[1]);
        }
      } else if (line.startsWith("- ") || line.startsWith("~ ")) {
        if (!set.moves) set.moves = [];
        set.moves.push(line.slice(2));
      } else {
        if (NATURE_REGEX.test(line)) set.nature = line.slice(0, -7);
      }
    }

    return set;
  }
}
