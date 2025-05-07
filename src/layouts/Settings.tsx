import { Button } from "@/components/common/Button";
import { SettingsGroup } from "@/components/common/SettingsGroup";
import { settings } from "@/settings";
import { BiExport, BiImport } from "react-icons/bi";
import { FaBomb, FaToggleOff, FaToggleOn } from "react-icons/fa6";

export function Settings() {
  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-col p-1 sm:p-4">
        <div class="flex flex-row justify-center items-start gap-4">
          <SettingsGroup title="Appearance">
            <div class="flex flex-col items-center p-2">
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
          </SettingsGroup>

          <SettingsGroup title="Data management">
            <div class="p-2 grid grid-cols-2 gap-2">
              <Button class="flex gap-1 items-center justify-between">
                <BiExport />
                Export data
              </Button>
              <Button class="flex gap-1 items-center justify-between">
                <BiImport />
                Import data
              </Button>
              <Button class="col-span-2 bg-red-700 border-red-700 hover:text-red-800 flex gap-1 items-center justify-center">
                <FaBomb />
                Clear data
              </Button>
            </div>
          </SettingsGroup>
        </div>
      </div>
    </main>
  )
}