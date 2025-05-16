import { dump, load } from "js-yaml";
import toast from "react-hot-toast";
import { FaBomb } from "react-icons/fa6";
import { BiExport, BiImport } from "react-icons/bi";
import { settings } from "@/settings";
import { clearData, exportData, exportTeams, importData } from "@/db/dataManagement";
import { Button } from "@/components/common/Button";
import { SettingsGroup } from "@/components/common/SettingsGroup";
import { confirm } from "@/components/common/confirm";
import { downloadFile, uploadFile } from "@/utils/fileUtils";
import { Toggle } from "@/components/common/Toggle";

export function Settings() {
  async function handleExport() {
    downloadFile(
      `pokemoncompanions ${new Date().toISOString().slice(0,10)}.yaml`,
      new Blob([dump(await exportData())], { type: "application/yaml" }),
    );
  }

  async function handleExportTeams() {
    downloadFile(
      `pokemoncompanions ${new Date().toISOString().slice(0,10)}.txt`,
      new Blob([await exportTeams()], { type: "text/plain" }),
    );
  }

  async function handleImport() {
    try {
      const data = load(await uploadFile("application/yaml,.yaml,.yml"));
      if (!Array.isArray(data)) throw new Error("Data not in expected format");
      await importData(data);
      toast.success("Data imported successfully");
    } catch (err) {
      if (err instanceof Error && err.message === "File picker cancelled") return;
      console.error(err);
      toast.error("Error while importing data");
    }
  }

  async function handleClear() {
    if (await confirm.call({
      prompt: <>Are you sure you want to clear all data?<br />This cannot be undone.</>,
      leftButton: {
        text: "Cancel",
        color: "gray",
        value: false,
      },
      rightButton: {
        text: "Clear data",
        color: "red",
        value: true,
      }
    })) {
      await clearData();
      toast.success("Data cleared successfully");
    }
  }

  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-col p-1 sm:p-4">
        <div class="flex flex-row justify-center items-start gap-4">
          <SettingsGroup title="Appearance">
            <div class="flex flex-col p-2">
              <label class="flex gap-2 items-center">
                <Toggle
                  checked={ settings.smallSpeciesSprites }
                  onChange={ (ev) => settings.smallSpeciesSprites = ev.currentTarget.checked }
                />
                Small species sprites
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
                onClick={ handleExportTeams }
              >
                <BiExport />
                Export to Showdown
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