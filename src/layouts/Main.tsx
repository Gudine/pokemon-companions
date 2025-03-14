import { selectedPage } from "../globalState";
import { SavedPlaythroughsContainer } from "./SavedPlaythroughsContainer";
import { SpeciesTrackerContainer } from "./SpeciesTrackerContainer";

export function Main() {
  if (selectedPage.value === "species") return <SpeciesTrackerContainer />;
  if (selectedPage.value === "pokemon") return <SavedPlaythroughsContainer />;

  return <></>;
}