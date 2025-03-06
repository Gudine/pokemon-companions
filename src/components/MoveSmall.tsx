import { Dex } from "@pkmn/dex";
import { useMemo } from "preact/hooks";
import { MoveEmpty } from "./MoveEmpty";

export function MoveSmall({ name }: { name?: string }) {
  const move = useMemo(() => {
    if (!name) return;
    const m = Dex.moves.get(name);
    return m.exists ? m : undefined;
  }, [name]);

  if (!move) return <MoveEmpty name={ name } />

  return (
    <div
      class="grid grid-cols-2 grid-rows-[repeat(2,max-content)] text-center
      rounded-2xl border-4 overflow-hidden"
      style={{ borderColor: `var(--color-type-${move.type.toLowerCase()}-dark)`}}
    >
      <p class="col-span-full text-sm bg-gray-100 pb-0.5 pt-0.5 pl-1 pr-1">
        {move.name.startsWith("Hidden Power") ? "Hidden Power" : move.name}
      </p>
      <p
        class="text-xs text-gray-100 pb-0.5 pt-0.5 pl-1 pr-1"
        style={{ backgroundColor: `var(--color-type-${move.type.toLowerCase()})`}}
      >
        {move.type}
      </p>
      <p
        class="text-xs text-gray-100 pb-0.5 pt-0.5 pl-1 pr-1"
        style={{ backgroundColor: `var(--color-attack-${move.category.toLowerCase()})`}}
      >
        {move.category}
      </p>
    </div>
  )
}