import type { SpeciesName } from "@pkmn/data";
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

interface Props {
  close: () => void;
  speciesName: SpeciesName;
}

export function SpeciesModal({ close, speciesName }: Props) {
  return (
    <Modal close={ close } class="w-9/10 h-9/10">
      <SpeciesModalInner close={ close } speciesName={ speciesName } />
    </Modal>
  )
}

function SpeciesModalInner({ speciesName }: Props) {
  const units = useDBResource(
    () => PokemonUnit.getBySpecies(speciesName),
    "pkmn",
    { species: speciesName },
  );

  const playthroughGens = useDBResource(
    async () => new Map((await Playthrough.getAll()).map((curr) => [curr.id, curr.gen])),
    "playthrough",
    {},
  );

  const forms = pokemonList.get(speciesName) ?? [];
  const formImages = forms.map((form) => ImgUtils.getPokemon(form));

  return (
    <div class="flex flex-row h-full">
      {forms.map((form, i) => <div class="grow flex flex-col gap-0 bg-stone-200 border-dotted not-last:border-r-2">
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
              .map(([data, set]) => (
                <GenProvider gen={ playthroughGens.get(data.playthrough) ?? 9 }>
                  <PokemonSmall key={ data.id } unit={ data } pkmn={ set! } />
                </GenProvider>))}
          </div>
        </div>
      </div>)}
    </div>
  )
}
