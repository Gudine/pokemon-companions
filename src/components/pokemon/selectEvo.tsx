import type { SpeciesName } from "@pkmn/data";
import { createCallable } from "@/utils/callUtils";
import { Modal } from "@/components/common/Modal";
import { SpeciesBig } from "@/components/species/SpeciesBig";

export const selectEvo = createCallable<{ evos: SpeciesName[] }, SpeciesName | void>(({ call, evos }) => {
  return (
    <Modal onClickOutside={ () => call.end() } class="min-w-80 max-w-4/5 min-h-80 max-h-9/10">
      <div
        class="p-4 w-full h-full flex flex-col gap-2 justify-around grow"
      >
        <p class="text-xl font-bold text-center">
          Select evolution
        </p>

        <div class="grow flex flex-row flex-wrap gap-2 justify-around">
          {evos.map((evo) => <button type="button" onClickCapture={(ev) => {
            ev.stopPropagation();
            call.end(evo);
          }}>
            <SpeciesBig name={ evo } completion={ 0 } />
          </button>)}
        </div>
      </div>
    </Modal>
  )
});
