import { selectedPage } from "@/globalState";
import { SpeciesTrackerContainer } from "./SpeciesTrackerContainer";
import { SavedPlaythroughsContainer } from "./SavedPlaythroughsContainer";
import { PokemonWorkshop } from "./PokemonWorkshop";

export function Main() {
  if (selectedPage.value === "speciesTracker") return <SpeciesTrackerContainer />;
  if (selectedPage.value === "savedPlaythroughs") return <SavedPlaythroughsContainer />;
  if (selectedPage.value === "pokemonWorkshop") return <PokemonWorkshop />;

  return <></>;
}