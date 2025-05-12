import type { SpeciesName } from "@pkmn/data";
import type { ReactCall } from "react-call";
import { FaCircleInfo } from "react-icons/fa6";
import { PokemonUnit } from "@/db/PokemonUnit";
import { useDBResource } from "@/hooks/useDBResource";
import { pokemonList } from "@/pokemonList";
import { ImgUtils } from "@/utils/imgUtils";
import { unpackSet } from "@/utils/setUtils";
import { GenProvider } from "@/contexts/GenContext";
import { Playthrough } from "@/db/Playthrough";
import { Placeholder } from "@/components/common/Placeholder";
import { Modal } from "@/components/common/Modal";
import { PokemonSmall } from "@/components/pokemon/PokemonSmall";
import { createCallable } from "@/utils/callUtils";
import { selectedPage } from "@/globalState";

interface Props {
  speciesName: SpeciesName;
}

export const showSpeciesUnits = createCallable<Props>(({ call, speciesName }) => {
  return (
    <Modal close={ () => call.end() } class="w-9/10 h-9/10">
      <SpeciesModalInner call={ call } speciesName={ speciesName } />
    </Modal>
  )
});

function SpeciesModalInner({ call, speciesName }: ReactCall.Props<Props, void, {}>) {
  const units = useDBResource(
    () => PokemonUnit.getBySpecies(speciesName),
    "pkmn",
    { species: speciesName },
  );

  const playthroughGens = new Map(useDBResource(
    Playthrough.getAll,
    "playthrough",
  ).map((curr) => [curr.id, curr.gen]));

  const forms = pokemonList.get(speciesName) ?? [];
  const formImages = forms.map((form) => ImgUtils.getPokemon(form));

  return (
    <div class="grid grid-rows-[max-content_1fr] grid-flow-col auto-cols-[minmax(85%,auto)] sm:auto-cols-[minmax(--spacing(80),auto)] h-full">
      {forms.map((form, i) => <div class="row-span-2 grid grid-rows-subgrid gap-0 bg-stone-200 border-dotted not-last:border-r-2">
        <div class="flex flex-col px-0.5 bg-linear-to-b from-transparent from-75% to-stone-400/65">
          <div class="grow flex flex-col items-center text-center px-1.5 pb-2
            border-dashed border-b-2">
            <span
              role="img"
              aria-label={ form }
              style={ formImages[i].css }
            />
            <span class="font-bold font-kodchasan text-md">{ form }</span>
          </div>
        </div>
        <div class="grow flex flex-col justify-center overflow-y-auto">
          <div class="p-2 gap-2 flex flex-row flex-wrap justify-around overflow-y-auto overflow-x-hidden">
            { units.filter((unit) => unit.form === form).length === 0 && <Placeholder /> }
            { units.filter((unit) => unit.form === form)
              .map((data) => [data, unpackSet(data.data, playthroughGens.get(data.playthrough) ?? 9)] as const)
              .filter(([_, set]) => set !== undefined)
              .map(([data, set]) => (<GenProvider gen={ playthroughGens.get(data.playthrough) ?? 9 }>
                <PokemonSmall
                  key={ data.id }
                  pkmn={ set! }
                  buttons={ [
                    <button
                      class="flex cursor-pointer hover:brightness-125"
                      onClick={ () => {
                        call.end();
                        window.location.hash = `#${data.playthrough}.${data.id}`;
                        selectedPage.value = "savedPlaythroughs";
                      } }
                    >
                      <FaCircleInfo title="More information" />
                    </button>
                  ] }
                />
              </GenProvider>))}
          </div>
        </div>
      </div>)}
    </div>
  )
}
