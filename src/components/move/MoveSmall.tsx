import type { Move } from "@pkmn/data";
import { useContext } from "preact/hooks";
import { GenContext } from "@/contexts/GenContext";

export function MoveSmall({ move }: { move: Move }) {
  const { gen } = useContext(GenContext);

  const hasCategory = gen >= 4;

  return (
    <div
      class={`grid ${hasCategory ? "grid-cols-2" : "grid-cols-1"} grid-rows-[repeat(2,max-content)] text-center
      rounded-2xl border-4 overflow-hidden border-type-unknown-dark`}
      style={{ borderColor: `var(--color-type-${move.type.toLowerCase()}-dark)`}}
    >
      <p class="col-span-full text-sm bg-gray-100 px-1 py-0.5">
        {move.name.startsWith("Hidden Power") ? "Hidden Power" : move.name}
      </p>
      <p
        class="text-xs text-gray-100 px-1 py-0.5 bg-type-unknown"
        style={{ backgroundColor: `var(--color-type-${move.type.toLowerCase()})`}}
      >
        {move.type}
      </p>
      {hasCategory && (<p
        class="text-xs text-gray-100 px-1 py-0.5 bg-type-unknown"
        style={{ backgroundColor: `var(--color-attack-${move.category.toLowerCase()})`}}
      >
        {move.category}
      </p>)}
    </div>
  )
}