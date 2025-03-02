import { useSignal } from "@preact/signals";
import { IPlaythrough } from "../db/db";
import { Playthrough } from "../db/Playthrough";

export function useSavePlaythrough() {
  const savingStatus = useSignal<"initial" | "saving" | "saved" | "error">("initial");
  const error = useSignal<string | undefined>();

  function save(playthrough: IPlaythrough) {
    if (savingStatus.value === "saving") throw new Error("Tried to save playthrough while saving another one");
    savingStatus.value = "saving";

    (async () => {
      try {
        await Playthrough.add(playthrough.name, playthrough.date, playthrough.gen);
        savingStatus.value = "saved";
      } catch (err) {
        if (err instanceof DOMException && err.name === "ConstraintError") {
          error.value = "Name already exists";
          savingStatus.value = "error";
        }
      }
    })();
  };

  return [savingStatus, save, error] as const;
}
