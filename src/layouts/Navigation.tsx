export function Navigation() {
  return (
    <nav class="flex flex-row justify-stretch
      bg-indigo-700 text-gray-100
      text-xl text-center">
      <a
        class="p-3 grow cursor-pointer border-1 border-indigo-700
          bg-gray-100 text-indigo-700"
      >
        Species tracker
      </a>
      <a
        class="p-3 grow cursor-pointer border-1 border-indigo-700
          hover:bg-gray-100 hover:text-indigo-700"
      >
        Saved Pokémon
      </a>
    </nav>
  )
}
