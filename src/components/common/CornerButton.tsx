import type { ButtonHTMLAttributes } from "preact/compat";

export function CornerButton({
  children,
  class: className = "",
  ...rest
}: ButtonHTMLAttributes) {
  return (
    <button
      class={`col-span-full row-span-full self-end justify-self-end mb-4 mr-4
        sticky w-24 h-24 bottom-4
        bg-indigo-700 hover:bg-indigo-600 text-gray-100 text-5xl rounded-full
        flex items-center justify-center
        select-none cursor-pointer ${className}`}
      {...rest}
    >
      +
    </button>
  )
}
