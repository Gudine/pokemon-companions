import { Suspense } from "preact/compat";
import { Loading } from "@/components/common/Loading";
import { SpeciesTracker } from "./SpeciesTracker";

export function SpeciesTrackerContainer() {
  return (
    <main class="grid grid-cols-1 grid-rows-1 grow">
      <div class="col-span-full row-span-full flex flex-row flex-wrap justify-evenly gap-2 p-2">
        <Suspense fallback={ <Loading /> }>
          <SpeciesTracker />
        </Suspense>
      </div>
    </main>
  )
}