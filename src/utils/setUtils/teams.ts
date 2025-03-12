import { type MinimalSet, Sets } from "./sets";

export interface Team {
  team: Partial<MinimalSet>[],
  format?: string,
  name?: string,
  folder?: string,
}

const HEADER_REGEX = /^=== *(?:\[([^\]\n]+)\])? *(?:(.+?)\/)?((?:[^\/\n ]?|[^\/\n ]+[^\/\n]*[^\/\n ]+)) *===$/gm;
type HeaderRegexMatches = RegExpExecArray & [
  string,
  format: string | undefined,
  folder: string | undefined,
  name: string | undefined,
];

export const Teams = new class {
  packTeam(team: Team): string {
    return team.team.map(Sets.packSet).join("]");
  }
  
  unpackTeam(buf: string): Team | undefined {
    if (!buf) return undefined;
    
    if (buf.charAt(0) === '[' && buf.charAt(buf.length - 1) === ']') {
      return { team: JSON.parse(buf) };
    }

    const team: Partial<MinimalSet>[] = [];

    for (const data of buf.split("]")) {
      const set = Sets.unpackSet(data);
      if (!set) return;
      team.push(set);
    }
    
    return { team: team };
  }

  exportTeam(team: Team): string {
    let buf = "";
  
    for (let i = 0; i < team.team.length; i += 1) {
      if (i > 0) buf += "\n\n";
      buf += Sets.exportSet(team.team[i]);
    }
  
    return buf;
  }

  private _importTeams(buf: string, one?: boolean) {
    const trimmed = buf.trim();
  
    const teams: Team[] = [];
  
    const headerMatches = Array.from(trimmed.matchAll(HEADER_REGEX)) as HeaderRegexMatches[];
  
    for (let i = -1; i < headerMatches.length; i += 1) {
      const match = headerMatches[i] as HeaderRegexMatches | undefined;
      const start = match ? (match.index + match[0].length) : 0;
      const end = headerMatches[i + 1]?.index ?? trimmed.length;
  
      if (end <= start) continue;
  
      const teamSets: Partial<MinimalSet>[] = [];
      
      const sliced = trimmed.slice(start, end).trim();
  
      for (const rawSet of sliced.split("\n\n")) {
        const imported = Sets.importSet(rawSet.trim());
  
        if (imported) teamSets.push(imported);
      }
  
      if (teamSets.length) {
        const team: Team = {
          team: teamSets,
          format: match?.[1],
          name: match?.[3],
          folder: match?.[2],
        };
        
        if (one) return [team];
        teams.push(team);
      }
    }
  
    return teams;
  }
  
  importTeam(buf: string) {
    const result = this._importTeams(buf, true);
    return result.length && result[0] || undefined;
  }

  exportTeams(teams: Readonly<Team[]>): string {
    let untitledCount = 0;

    let buf = "";

    for (let i = 0; i < teams.length; i += 1) {
      if (i > 0) buf += "\n\n";
      const team = teams[i];
      
      const format = team.format && "[" + team.format + "]";
      const name = team.name || "Untitled " + ++untitledCount;
      const fullName = team.folder ? (team.folder + "/" + name) : name;
      const header = "=== " + ((format && format + " ") ?? "") + fullName + " ===";

      buf += header + "\n\n" + this.exportTeam(team);
    }

    return buf;
  }

  importTeams(buf: string) {
    return this._importTeams(buf);
  }
}
