import { selectedPage } from "@/globalState";
import { SpeciesTrackerContainer } from "./SpeciesTrackerContainer";
import { SavedPlaythroughsContainer } from "./SavedPlaythroughsContainer";
import { PokemonWorkshop } from "./PokemonWorkshop";
import { Settings } from "./Settings";

export function Main() {
  switch (selectedPage.value) {
    case "speciesTracker": return <SpeciesTrackerContainer />;
    case "savedPlaythroughs": return <SavedPlaythroughsContainer />;
    case "pokemonWorkshop": return <PokemonWorkshop />;
    case "settings": return <Settings />;
    default: return <></>;
  }
}