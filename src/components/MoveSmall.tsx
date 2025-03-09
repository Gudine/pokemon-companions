import { useContext, useMemo } from "preact/hooks";
import { MoveInvalid } from "./MoveInvalid";
import { gens } from "../data";
import { GenContext } from "../contexts/GenContext";

export function MoveSmall({ name }: { name?: string }) {
  const { gen } = useContext(GenContext);

  const move = useMemo(() => {
    if (!name) return;
    return gens.get(gen).moves.get(name);
  }, [name]);

  if (!move) return <MoveInvalid name={ name } />

  const hasCategory = gen >= 4;

  return (
    <div
      class={`grid ${hasCategory ? "grid-cols-2" : "grid-cols-1"} grid-rows-[repeat(2,max-content)] text-center
      rounded-2xl border-4 overflow-hidden`}
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
      {hasCategory && (<p
        class="text-xs text-gray-100 pb-0.5 pt-0.5 pl-1 pr-1"
        style={{ backgroundColor: `var(--color-attack-${move.category.toLowerCase()})`}}
      >
        {move.category}
      </p>)}
    </div>
  )
}