import { selectedPage } from "../globalState";
import { SavedPlaythroughsContainer } from "./SavedPlaythroughsContainer";
import { SpeciesTracker } from "./SpeciesTracker";

export function Main() {
  if (selectedPage.value === "species") return <SpeciesTracker />;
  if (selectedPage.value === "pokemon") return <SavedPlaythroughsContainer />;

  return <></>;
}