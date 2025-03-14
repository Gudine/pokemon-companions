import { Modal } from "./common/Modal";
import { Suspense } from "preact/compat";
import { Loading } from "./common/Loading";
import { AddPokemonModal } from "./AddPokemonModal";

interface Props {
  close: () => void;
  playthrough?: string;
}

export function AddPokemonModalContainer({ close, playthrough: defaultPlaythrough }: Props) {
  return (
    <Modal close={ close } class="w-9/10 h-9/10">
      <Suspense fallback={ <Loading /> }>
        <AddPokemonModal close={ close } playthrough={ defaultPlaythrough } />
      </Suspense>
    </Modal>
  )
}
