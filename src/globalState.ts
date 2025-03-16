import { signal } from "@preact/signals";

export type SelectedPage = "speciesTracker" | "savedPlaythroughs" | "pokemonWorkshop";

export const selectedPage = signal<SelectedPage>("speciesTracker");

export const selectedPage = signal<SelectedPage>("species");