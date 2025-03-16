import type { IPlaythroughWithId } from "@/db/db";
import { GenProvider } from "@/contexts/GenContext";
import { PokemonUnit } from "@/db/PokemonUnit";
import { useDBResource } from "@/hooks/useDBResource";
import { unpackSet } from "@/utils/setUtils";
import { Placeholder } from "@/components/common/Placeholder";
import { SpeciesPokemonBig } from "@/components/pokemon/SpeciesPokemonBig";

export function PlaythroughSectionList({ playthrough }: { playthrough: IPlaythroughWithId }) {
  const units = useDBResource(
    () => PokemonUnit.getByPlaythrough(playthrough.id),
    "pkmn",
    { playthrough: playthrough.id },
  );
  
  return (
    <GenProvider gen={ playthrough.gen }>
      { units.length === 0 && <Placeholder /> }
      { units.map((info) => ({ ...info, set: unpackSet(info.data, playthrough.gen) }))
        .filter(({ set }) => set !== undefined)
        .map(({ id, set }) => (<SpeciesPokemonBig key={ id } pkmn={ set! } />))}
    </GenProvider>
  )
}