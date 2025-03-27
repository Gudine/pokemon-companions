import type { IPlaythrough } from "@/db/db";
import { GenProvider } from "@/contexts/GenContext";
import { PokemonUnit } from "@/db/PokemonUnit";
import { useDBResource } from "@/hooks/useDBResource";
import { unpackSet } from "@/utils/setUtils";
import { Placeholder } from "@/components/common/Placeholder";
import { PokemonBig } from "@/components/pokemon/PokemonBig";

export function PlaythroughSectionList({ playthrough }: { playthrough: IPlaythrough }) {
  const units = useDBResource(
    () => PokemonUnit.getByPlaythrough(playthrough.id),
    "pkmn",
    { playthrough: playthrough.id },
  );
  
  return (
    <GenProvider gen={ playthrough.gen }>
      { units.length === 0 && <Placeholder /> }
      { units.map((data) => [data, unpackSet(data.data, playthrough.gen)] as const)
        .filter(([_, set]) => set !== undefined)
        .map(([data, set]) => (<PokemonBig key={ data.id } unit={ data } pkmn={ set! } />))}
    </GenProvider>
  )
}