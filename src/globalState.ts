import type { PokemonFormInputs } from "./components/pokemon/AddPokemonModal";
import { signal } from "@preact/signals";

export type SelectedPage = "speciesTracker" | "savedPlaythroughs" | "pokemonWorkshop";

export const selectedPage = signal<SelectedPage>("speciesTracker");

export const storedFormData = signal<Partial<PokemonFormInputs>>({});