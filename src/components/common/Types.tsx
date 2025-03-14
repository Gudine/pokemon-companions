import type { Specie } from "@pkmn/data";

export function Types({ types }: { types: Specie["types"] }) {
  return (
    <div class="flex flex-row justify-center">
      {types.map((type) => (
        <p
          class="rounded-sm text-white basis-1/2 bg-type-unknown"
          style={{ backgroundColor: `var(--color-type-${type.toLowerCase()})` }}
        >
          {type}
        </p>
      ))}
    </div>
  )
}
