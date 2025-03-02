import { selectedPage } from "../globalState";

export function Navigation() {
  return (
    <nav class="flex flex-row justify-stretch
      bg-indigo-700 text-gray-100
      text-xl text-center">
      <a
        onClick={() => selectedPage.value = "species"}
        class={`p-3 grow cursor-pointer border-1 border-indigo-700
          hover:bg-gray-100 hover:text-indigo-700
          ${selectedPage.value === "species" ? "bg-gray-100 text-indigo-700" : ""}`}
      >
        Species tracker
      </a>
      <a
        onClick={() => selectedPage.value = "pokemon"}
        class={`p-3 grow cursor-pointer border-1 border-indigo-700
          hover:bg-gray-100 hover:text-indigo-700
          ${selectedPage.value === "pokemon" ? "bg-gray-100 text-indigo-700" : ""}`}
      >
        Saved Pokémon
      </a>
    </nav>
  )
}
