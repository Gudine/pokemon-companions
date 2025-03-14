import { PlaythroughSection } from "@/components/playthrough/PlaythroughSection";
import { Playthrough } from "@/db/Playthrough";
import { useDBResource } from "@/hooks/useDBResource";

export function SavedPlaythroughs() {
  const playthroughs = useDBResource(
    Playthrough.getAll,
    "playthrough",
  );

  return playthroughs.map((playthrough) => (<PlaythroughSection key={ playthrough.name } playthrough={ playthrough }/>));
}