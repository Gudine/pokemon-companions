import { SpeciesPokemonSmall } from "./SpeciesPokemonSmall";
import { unpackSet } from "../utils/setUtils";
import { IPlaythrough } from "../db/db";
import { PokemonUnit } from "../db/PokemonUnit";
import { Placeholder } from "./common/Placeholder";
import { GenProvider } from "../contexts/GenContext";
import { useDBResource } from "../hooks/useDBResource";

export function PlaythroughSectionList({ playthrough }: { playthrough: IPlaythrough }) {
  const units = useDBResource(
    () => PokemonUnit.getByPlaythrough(playthrough.name),
    "pkmn",
    { playthrough: playthrough.name },
  );
  
  return (
    <GenProvider gen={ playthrough.gen }>
      { units.length === 0 && <Placeholder /> }
      { units.map((info) => ({ ...info, set: unpackSet(info.data, playthrough.gen) }))
        .filter(({ set }) => set !== undefined)
        .map(({ id, set }) => (<SpeciesPokemonSmall key={ id } pkmn={ set! } />))}
    </GenProvider>
  )
}