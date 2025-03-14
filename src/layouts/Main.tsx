import { selectedPage } from "@/globalState";
import { SpeciesTrackerContainer } from "./SpeciesTrackerContainer";
import { SavedPlaythroughsContainer } from "./SavedPlaythroughsContainer";

export function Main() {
  if (selectedPage.value === "species") return <SpeciesTrackerContainer />;
  if (selectedPage.value === "pokemon") return <SavedPlaythroughsContainer />;

  return <></>;
}