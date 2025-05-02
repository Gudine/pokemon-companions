import { settings } from "@/settings";
import { FaToggleOff, FaToggleOn } from "react-icons/fa6";

export function Settings() {
  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-col p-1 sm:p-4">
        <div class="flex flex-col items-center">
          <label class="flex gap-2 items-center">
            <div class="text-3xl flex cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                checked={ settings.smallPokemonSprites }
                onChange={ (ev) => settings.smallPokemonSprites = ev.currentTarget.checked }
              />
              {/* @ts-expect-error */}
              <FaToggleOff className="peer-checked:hidden" />
              {/* @ts-expect-error */}
              <FaToggleOn className="peer-not-checked:hidden text-indigo-700" />
            </div>
            Small Pokémon sprites
          </label>
        </div>
      </div>
    </main>
  )
}