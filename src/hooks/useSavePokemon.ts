import { useSignal } from "@preact/signals";
import { PokemonUnit } from "../db/PokemonUnit";
import { PartialPkmnSet } from "../utils/setUtils";

export function useSavePokemon() {
  const savingStatus = useSignal<"initial" | "saving" | "saved" | "error">("initial");
  const error = useSignal<string | undefined>();

  function save(pkmn: PartialPkmnSet, playthrough: string) {
    if (savingStatus.value === "saving") throw new Error("Tried to save Pokémon while saving another one");
    savingStatus.value = "saving";

    (async () => {
      try {
        await PokemonUnit.add(pkmn, playthrough);
        savingStatus.value = "saved";
      } catch (err) {
        if (err instanceof Error && err.message.match(/^Species .+? not found$/)) {
          error.value = err.message;
          savingStatus.value = "error";
        }
      }
    })();
  };

  return [savingStatus, save, error] as const;
}
