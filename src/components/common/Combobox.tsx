import type { FieldPath, FieldPathValue, FieldValues, RegisterOptions, UseFormReturn } from "react-hook-form";
import type { ComponentChild } from "preact";
import { type InputHTMLAttributes, type HTMLAttributes, useId } from "preact/compat";
import { useSignal } from "@preact/signals";

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
  const listboxId = useId();
  const isFocused = useSignal<boolean>(false);

  const { watch, setValue, register } = formHook;
  const value = watch(name) || "";

  const filtered = [
    ...defaultList.filter((data) => match(value, data)),
    ...datalist.filter((data) => value && match(value, data)),
  ];

  const dropdownActive = isFocused.value && !!filtered.length;

  const selectItem = (item: HTMLElement) => {
    setValue(name, item.dataset.value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  const handleClick: HTMLAttributes<HTMLUListElement>["onMouseDown"] = (ev) => {
    if (ev.target instanceof HTMLElement) {
      const item = ev.target.closest("li");

      if (item) selectItem(item);
    }
  }

  const handleKeyDown: HTMLAttributes<HTMLDivElement>["onKeyDown"] = (ev) => {
    const focusedElement = ev.currentTarget.querySelector<HTMLElement>(":focus");

    if (!dropdownActive || !focusedElement) return;

    const inputIsFocused = focusedElement.tagName === "INPUT";

    if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      if (inputIsFocused) return;
      selectItem(focusedElement);
    } else if (ev.code === "ArrowUp") {
      ev.preventDefault();
      if (inputIsFocused) {
        const lastItem = ev.currentTarget.querySelector<HTMLElement>("li[data-value]:last-child");
        lastItem?.focus();
      } else {
        const prevElem = focusedElement.previousElementSibling as HTMLElement | null;
        if (prevElem) prevElem.focus();
        else ev.currentTarget.querySelector("input")?.focus();
      }
    } else if (ev.code === "ArrowDown") {
      ev.preventDefault();

      if (inputIsFocused) {
        const firstItem = ev.currentTarget.querySelector<HTMLElement>("li[data-value]");
        firstItem?.focus();
      } else {
        const nextElem = focusedElement.nextElementSibling as HTMLElement | null;
        if (nextElem) nextElem.focus();
      }
    }
  };

  return (
    <div
      class="relative flex flex-col"
      onFocusOut={(ev) => { isFocused.value = ev.currentTarget.matches(":focus-within"); }}
      onFocusIn={(ev) => { isFocused.value = ev.currentTarget.matches(":focus-within"); }}
      onKeyDown={handleKeyDown}
    >
      <input
        id={ id }
        type="text"
        role="combobox"
        aria-expanded={dropdownActive}
        aria-autocomplete="list"
        aria-controls={listboxId}
        placeholder={ placeholder }
        class={ className }
        {...register(name, registerOpts)}
      />
      <div class={`absolute w-full min-w-max left-1/2 right-1/2 -translate-x-1/2 top-[110%]
        bg-gray-100 border-2 border-stone-500 rounded-lg
        z-1 overflow-hidden ${dropdownActive ? "block" : "hidden"}`}>
        <ul
          id={listboxId}
          role="listbox"
          class="flex flex-col max-h-[10em] overflow-auto"
          onClick={ handleClick }
          tabindex={ -1 }
        >
          {filtered.map((data) => <li
            key={ data }
            data-value={ data }
            role="option"
            tabindex={ -1 }
            class="text-stone-700 pt-1 pb-1 pl-2 pr-2
              hover:bg-gray-300 focus:bg-gray-300 focus:outline-0 select-none"
          >
            {data}
          </li>)}
        </ul>
      </div>
    </div>
  )
}
