import type { ButtonHTMLAttributes } from "preact/compat";

const buttonColors = {
  purple: "bg-indigo-700 border-indigo-700 text-gray-100 hover:bg-gray-100 hover:text-indigo-700",
  red: "bg-red-600 border-red-600 text-gray-100 hover:bg-gray-100 hover:text-red-800",
  gray: "bg-neutral-300 border-neutral-400 text-neutral-800 hover:bg-neutral-100",
};

export type ButtonColor = keyof typeof buttonColors;

export function Button({
  children,
  class: className = "",
  color = "purple",
  ...rest
}: ButtonHTMLAttributes & { color?: ButtonColor }) {
  return (
    <button
      class={`px-2 py-1 rounded-lg border-2 enabled:cursor-pointer
        disabled:bg-stone-600 disabled:border-stone-600 disabled:text-stone-50
        ${buttonColors[color]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
