import { Suspense } from "preact/compat";
import { Loading } from "@/components/common/Loading";
import { Tabs } from "@/components/common/Tabs";
import { AddPokemonForm } from "@/components/pokemon/form/AddPokemonForm";
import { ImportPokemonForm } from "@/components/pokemon/form/ImportPokemonForm";

export function PokemonWorkshop() {
  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-col p-1 sm:p-2">
        <Tabs tabs={[
          {
            title: "Add new Pokémon",
            content: (<Suspense fallback={ <Loading /> }>
              <AddPokemonForm />
            </Suspense>),
          },
          {
            title: "Import from Showdown",
            content: (<Suspense fallback={ <Loading /> }>
              <ImportPokemonForm />
            </Suspense>),
          }
        ]} />
      </div>
    </main>
  )
}