import { selectedPage } from "@/globalState";

export function Navigation() {
  return (
    <nav class="flex flex-row justify-stretch
      bg-indigo-700 text-gray-100
      text-xl text-center">
      <a
        onClick={() => selectedPage.value = "speciesTracker"}
        class={`p-3 grow cursor-pointer border-1 border-indigo-700
          hover:bg-gray-100 hover:text-indigo-700
          ${selectedPage.value === "speciesTracker" ? "bg-gray-100 text-indigo-700" : ""}`}
      >
        Species tracker
      </a>
      <a
        onClick={() => selectedPage.value = "savedPlaythroughs"}
        class={`p-3 grow cursor-pointer border-1 border-indigo-700
          hover:bg-gray-100 hover:text-indigo-700
          ${selectedPage.value === "savedPlaythroughs" ? "bg-gray-100 text-indigo-700" : ""}`}
      >
        Saved playthroughs
      </a>
      <a
        onClick={() => selectedPage.value = "pokemonWorkshop"}
        class={`p-3 grow cursor-pointer border-1 border-indigo-700
          hover:bg-gray-100 hover:text-indigo-700
          ${selectedPage.value === "pokemonWorkshop" ? "bg-gray-100 text-indigo-700" : ""}`}
      >
        Pokémon workshop
      </a>
    </nav>
  )
}
