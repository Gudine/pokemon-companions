import { signal } from "@preact/signals";
import type { PokemonFormInputs } from "./components/pokemon/form/AddPokemonForm";

export type SelectedPage = "speciesTracker" | "savedPlaythroughs" | "pokemonWorkshop" | "settings";

export const selectedPage = signal<SelectedPage>("speciesTracker");

export const storedFormData = signal<Partial<PokemonFormInputs>>({});