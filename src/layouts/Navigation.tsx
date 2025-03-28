import { selectedPage } from "@/globalState";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { FaBars } from "react-icons/fa6";

export function Navigation() {
  const buttonRef = useRef(null);
  const isOpen = useSignal(false);
  const isSmallScreen = useMediaQuery("(width >= 40rem)");

  useEffect(() => {
    const callback = (ev: MouseEvent) => {
      if (buttonRef.current && !ev.composedPath().includes(buttonRef.current)) {
        isOpen.value = false;
      }
    };

    document.addEventListener("click", callback);

    return () => {
      document.removeEventListener("click", callback);
    };
  }, [buttonRef, isOpen]);

  return (
    <nav
      class="relative flex flex-col bg-indigo-700 text-gray-100 text-xl text-center"
    >
      { !isSmallScreen.value && (<button
        ref={ buttonRef }
        type="button"
        class={`p-3 grow cursor-pointer border-1 border-indigo-700
          hover:bg-gray-100 hover:text-indigo-700
          ${isOpen.value ? "bg-gray-100 text-indigo-700" : ""}`}
        onClick={ () => isOpen.value = !isOpen.value }
      >
        <FaBars title="Navigation menu" />
      </button>) }
      { (isOpen.value || isSmallScreen.value) && <div
        class="z-20 absolute top-full inset-x-0
          flex flex-col justify-stretch
          sm:static sm:flex-row">
        <a
          onClick={() => selectedPage.value = "speciesTracker"}
          class={`p-3 grow cursor-pointer border-1 border-indigo-700
            hover:bg-gray-100 hover:text-indigo-700
            ${selectedPage.value === "speciesTracker" ? "bg-gray-100 text-indigo-700" : "bg-indigo-700"}`}
        >
          Species tracker
        </a>
        <a
          onClick={() => selectedPage.value = "savedPlaythroughs"}
          class={`p-3 grow cursor-pointer border-1 border-indigo-700
            hover:bg-gray-100 hover:text-indigo-700
            ${selectedPage.value === "savedPlaythroughs" ? "bg-gray-100 text-indigo-700" : "bg-indigo-700"}`}
        >
          Saved playthroughs
        </a>
        <a
          onClick={() => selectedPage.value = "pokemonWorkshop"}
          class={`p-3 grow cursor-pointer border-1 border-indigo-700
            hover:bg-gray-100 hover:text-indigo-700
            ${selectedPage.value === "pokemonWorkshop" ? "bg-gray-100 text-indigo-700" : "bg-indigo-700"}`}
        >
          Pokémon workshop
        </a>
      </div> }
    </nav>
  )
}
