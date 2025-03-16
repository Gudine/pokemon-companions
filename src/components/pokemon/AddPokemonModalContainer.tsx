import { Suspense } from "preact/compat";
import { Modal } from "@/components/common/Modal";
import { Loading } from "@/components/common/Loading";
import { ImportPokemonModal } from "./ImportPokemonModal";

interface Props {
  close: () => void;
  playthrough?: number;
}

export function AddPokemonModalContainer({ close, playthrough: defaultPlaythrough }: Props) {
  return (
    <Modal close={ close } class="w-9/10 h-9/10">
      <Suspense fallback={ <Loading /> }>
        <ImportPokemonModal close={ close } playthrough={ defaultPlaythrough } />
      </Suspense>
    </Modal>
  )
}
