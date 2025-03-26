import type { UseFormReturn } from "react-hook-form";
import { useContext } from "preact/hooks";
import { GenContext } from "@/contexts/GenContext";
import { Combobox } from "@/components/common/Combobox";

export interface MoveSmallFormInputs {
  move?: [
    string | undefined,
    string | undefined,
    string | undefined,
    string | undefined,
  ],
}

interface Props {
  index: 0 | 1 | 2 | 3, // Exclude<keyof Required<MoveSmallFormInputs>["move"], keyof any[]>,
  formHook: UseFormReturn<MoveSmallFormInputs>,
}

export function MoveSmallForm({ formHook, index }: Props) {
  const { data, gen } = useContext(GenContext);
  const { watch } = formHook;

  const moveName = watch(`move.${index}`);
  const move = moveName && data.moves.get(moveName) || undefined;

  const hasCategory = gen >= 4;

  const validate = (v?: string) => {
    if (index === 0 && !v) return "First move must be specified";
    if (v && (data.moves.get(v)?.name !== v)) return `Move "${v}" not found`;
    return true
  };

  return (
    <div
      class={`grid ${hasCategory ? "grid-cols-2" : "grid-cols-1"} grid-rows-[repeat(2,max-content)] text-center
      rounded-2xl border-4 --overflow-hidden border-type-unknown-dark`}
      style={move ? { borderColor: `var(--color-type-${move.type.toLowerCase()}-dark)`} : {}}
    >
      <div class="col-span-full">
        <Combobox
          class="rounded-t-xl [text-align:inherit] text-sm bg-gray-100 px-1 py-0.5"
          placeholder={ "--" }
          name={`move.${index}`}
          formHook={formHook}
          registerOpts={{ validate }}
          datalist={[...data.moves].filter((move) => !move.isMax && !move.isZ).map((move) => move.name)}
        />
      </div>
      <p
        class={`text-xs text-gray-100 px-1 py-0.5
          bg-type-unknown rounded-bl-xl ${!hasCategory ? "rounded-br-xl" : ""}`}
        style={move ? { backgroundColor: `var(--color-type-${move.type.toLowerCase()})`} : {}}
      >
        {move?.type || "--"}
      </p>
      {hasCategory && (<p
        class="text-xs text-gray-100 px-1 py-0.5 bg-type-unknown rounded-br-xl"
        style={move ? { backgroundColor: `var(--color-attack-${move.category.toLowerCase()})`} : {}}
      >
        {move?.category || "--"}
      </p>)}
    </div>
  )
}