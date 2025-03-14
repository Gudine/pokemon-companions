import { Playthrough } from "../db/Playthrough";
import { PlaythroughSection } from "../components/PlaythroughSection";
import { useDBResource } from "../hooks/useDBResource";

export function SavedPlaythroughs() {
  const playthroughs = useDBResource(
    Playthrough.getAll,
    "playthrough",
  );

  return playthroughs.map((playthrough) => (<PlaythroughSection key={ playthrough.name } playthrough={ playthrough }/>));
}