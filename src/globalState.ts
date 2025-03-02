import { signal } from "@preact/signals";

export type SelectedPage = "species" | "pokemon";

export const selectedPage = signal<SelectedPage>("species");