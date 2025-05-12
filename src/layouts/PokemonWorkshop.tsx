import { Suspense } from "preact/compat";
import { Loading } from "@/components/common/Loading";
import { AddPokemonForm } from "@/components/pokemon/form/AddPokemonForm";

export function PokemonWorkshop() {
  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-col p-1 sm:p-4">
        <Suspense fallback={ <Loading /> }>
          <AddPokemonForm />
        </Suspense>
      </div>
    </main>
  )
}