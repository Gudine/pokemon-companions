interface Props {
  class: string,
  close: () => void,
  children?: any,
}

export function Modal({ class: className, close, children }: Props) {
  return (
    <div
      onClick={(ev) => ev.target === ev.currentTarget && close()}
      class="fixed inset-0 bg-black/40 flex items-center justify-center"
    >
      <div class={`rounded-4xl ${className}
        bg-stone-200 border-4 border-stone-500 p-4`}>
          {children}
      </div>
    </div>
  )
}
