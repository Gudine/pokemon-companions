import { selectedPage } from "@/globalState";
import { SpeciesTrackerContainer } from "./SpeciesTrackerContainer";
import { SavedPlaythroughsContainer } from "./SavedPlaythroughsContainer";

export function Main() {
  if (selectedPage.value === "speciesTracker") return <SpeciesTrackerContainer />;
  if (selectedPage.value === "savedPlaythroughs") return <SavedPlaythroughsContainer />;

  return <></>;
}