import { selectedPage } from "../globalState";
import { SavedPlaythroughs } from "./SavedPlaythroughs";
import { SpeciesTracker } from "./SpeciesTracker";

export function Main() {
  if (selectedPage.value === "species") return <SpeciesTracker />;
  if (selectedPage.value === "pokemon") return <SavedPlaythroughs />;

  return <></>;
}