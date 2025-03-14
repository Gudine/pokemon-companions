export function MoveInvalid({ name }: { name?: string }) {
  return (
    <div
      class="flex items-center justify-center text-center self-stretch
      border-type-unknown-dark bg-type-unknown-light
      rounded-2xl border-4 overflow-hidden
      h-[calc(var(--text-sm)*var(--text-sm--line-height)+var(--text-xs)*var(--text-xs--line-height)+var(--spacing)*4)]"
    >
      <p>
        {name?.trim() || "--"}
      </p>
    </div>
  )
}