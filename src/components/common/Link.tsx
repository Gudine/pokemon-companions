import type { AnchorHTMLAttributes } from "preact/compat";

export function Link({
  children,
  class: className = "",
  ...rest
}: AnchorHTMLAttributes) {
  return (
    <a
      class={`text-cyan-400 visited:text-cyan-500 hover:text-cyan-300 active:text-cyan-300 ${className}`}
      {...rest}
    >
      {children}
    </a>
  )
}
