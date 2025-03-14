import { AiOutlineLoading } from "react-icons/ai";

export function Loading() {
  return (
    <div class="flex items-center justify-center w-full h-full text-4xl p-4 text-indigo-700">
      <AiOutlineLoading
        /* @ts-expect-error */
        className="animate-spin"
      />
    </div>
  )
}
