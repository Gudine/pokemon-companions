import type { ButtonHTMLAttributes } from "preact/compat";

export function Button({
  children,
  class: className = "",
  ...rest
}: ButtonHTMLAttributes) {
  return (
    <button
      class={`bg-indigo-700 text-gray-100 rounded-lg
        border-2 border-indigo-700 enabled:cursor-pointer
        hover:bg-gray-100 hover:text-indigo-700
        disabled:bg-stone-600 disabled:border-stone-600 disabled:text-stone-50
        px-2 py-1
        ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
