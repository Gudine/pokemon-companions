import { dump, load } from "js-yaml";
import toast from "react-hot-toast";
import { FaBomb, FaToggleOff, FaToggleOn } from "react-icons/fa6";
import { BiExport, BiImport } from "react-icons/bi";
import { settings } from "@/settings";
import { clearData, exportData, importData } from "@/db/dataManagement";
import { Button } from "@/components/common/Button";
import { SettingsGroup } from "@/components/common/SettingsGroup";

const reader = new FileReader();

function readFile(file: File) {
  const promise = new Promise<string>((res) => {
    function readCallback() {
      reader.removeEventListener("load", readCallback);
      res(reader.result as string);
    }

    reader.addEventListener("load", readCallback);
  });

  reader.readAsText(file);
  return promise;
}

export function Settings() {
  async function handleExport() {
    const blob = new Blob([dump(await exportData())], { type: "application/yaml" });
  
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob)
    a.download = `pokemoncompanions ${new Date().toISOString().slice(0,10)}.yaml`;
  
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleImport() {
    const input = document.createElement('input');
    input.type = "file";
    input.accept = "application/yaml,.yaml,.yml";
    
    input.addEventListener("change", async () => {
      try {
        const file = input.files![0];
        const data = load(await readFile(file));
        if (!Array.isArray(data)) throw new Error("Data not in expected format");
        await importData(data);
        toast.success("Data imported successfully");
      } catch (err) {
        console.error(err);
        toast.error("Error while importing data");
      }
    });
  
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  async function handleClear() {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      await clearData();
      toast.success("Data cleared successfully");
    }
  }

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
              <Button
                class="flex gap-1 items-center justify-between"
                onClick={ handleExport }
              >
                <BiExport />
                Export data
              </Button>
              <Button
                class="flex gap-1 items-center justify-between"
                onClick={ handleImport }
              >
                <BiImport />
                Import data
              </Button>
              <Button
                class="col-span-2 flex gap-1 items-center justify-center"
                color="red"
                onClick={ handleClear }
              >
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