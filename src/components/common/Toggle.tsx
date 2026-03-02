import type { InputHTMLAttributes } from "preact/compat";
import { FaToggleOff, FaToggleOn } from "react-icons/fa6";

export function Toggle(props: Omit<InputHTMLAttributes & { type: "checkbox" }, "type" | "class">) {
  return (
    <div class="text-3xl flex cursor-pointer">
      <input
        type="checkbox"
        class="sr-only peer"
        {...props}
      />
      <FaToggleOff className="peer-checked:hidden" />
      <FaToggleOn className="peer-not-checked:hidden text-indigo-700" />
    </div>
  );
}