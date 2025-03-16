import type { InputHTMLAttributes, HTMLAttributes } from "preact/compat";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { SpeciesName } from "@pkmn/data";

interface Props {
  id?: string,
  class?: InputHTMLAttributes["class"],
  placeholder?: InputHTMLAttributes["placeholder"],
  datalist: string[],
  defaultList?: string[],
  register: UseFormRegisterReturn,
  watch: () => string,
  setValue: (v: string) => void,
}

function match(search: string, target: string) {
  const targetWords = target.split(/\W+/g);
  const searchWords = search.split(/\W+/g);

  return searchWords.every((sWord) => targetWords.some((tWord) => tWord.toLowerCase().startsWith(sWord.toLowerCase())))
}

export function Combobox({
  id,
  class: className = "",
  placeholder,
  datalist,
  defaultList = [],
  register,
  watch,
  setValue,
}: Props) {
  const value = watch();

  const filtered = [
    ...defaultList.filter((data) => match(value, data)),
    ...datalist.filter((data) => value && match(value, data)),
  ];

  const handleClick: HTMLAttributes<HTMLUListElement>["onMouseDown"] = (ev) => {
    if (ev.target instanceof HTMLElement) {
      const item = ev.target.closest("li");
      if (item) setValue(item.textContent as SpeciesName);
    }
  }

  return (
    <div class="relative flex flex-col">
      <input
        id={ id }
        type="text"
        placeholder={ placeholder }
        class={ className + " peer" }
        {...register}
      />
      <div class={`absolute w-full min-w-max left-1/2 right-1/2 -translate-x-1/2 top-[110%]
        bg-gray-100 border-2 border-stone-500 rounded-lg
        z-1 overflow-hidden hidden ${filtered.length ? "peer-focus:block" : ""}`}>
        <ul
          class="flex flex-col max-h-[10em] overflow-auto"
          onMouseDown={ handleClick }
        >
          {filtered.map((data) => <li
            key={ data }
            class="text-stone-700 pt-1 pb-1 pl-2 pr-2 hover:bg-gray-300 select-none"
          >
            {data}
          </li>)}
        </ul>
      </div>
    </div>
  )
}
