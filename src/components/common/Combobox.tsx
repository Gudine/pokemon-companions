import type { InputHTMLAttributes, HTMLAttributes } from "preact/compat";
import type { FieldPath, FieldPathValue, FieldValues, RegisterOptions, UseFormReturn } from "react-hook-form";
import type { ComponentChild } from "preact";

type StringField<T extends FieldValues> = {
  [Key in FieldPath<T>]: FieldPathValue<T, Key> extends (string | undefined) ? Key : never;
}[FieldPath<T>];

interface Props<T extends FieldValues, U extends StringField<T>> {
  id?: string,
  class?: InputHTMLAttributes["class"],
  placeholder?: InputHTMLAttributes["placeholder"],
  datalist: string[],
  defaultList?: string[],

  name: U,
  formHook: UseFormReturn<T>,
  registerOpts?: RegisterOptions<T, U>,
}

function match(search: string, target: string) {
  const targetWords = target.split(/\W+/g);
  const searchWords = search.split(/\W+/g);

  return searchWords.every((sWord) => targetWords.some((tWord) => tWord.toLowerCase().startsWith(sWord.toLowerCase())))
}

export function Combobox<T extends FieldValues, U extends StringField<T>>(props: Props<T, U>): ComponentChild;
export function Combobox({
  id,
  class: className = "",
  placeholder,
  datalist,
  defaultList = [],
  name,
  formHook,
  registerOpts = {},
}: Props<Record<string, string | undefined>, string>) {
  const { watch, setValue, register } = formHook;

  const value = watch(name) || "";

  const filtered = [
    ...defaultList.filter((data) => match(value, data)),
    ...datalist.filter((data) => value && match(value, data)),
  ];

  const handleClick: HTMLAttributes<HTMLUListElement>["onMouseDown"] = (ev) => {
    if (ev.target instanceof HTMLElement) {
      const item = ev.target.closest("li");
      if (item) setValue(name, item.textContent ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }

  return (
    <div class="relative flex flex-col">
      <input
        id={ id }
        type="text"
        placeholder={ placeholder }
        class={ className + " peer" }
        {...register(name, registerOpts)}
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
