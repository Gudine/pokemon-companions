import type { Specie, SpeciesName } from "@pkmn/data";
import type { IPokemonUnit } from "@/db/db";
import type { MinimalSet } from "@/utils/setUtils/sets";
import { FaCircleArrowLeft, FaFloppyDisk, FaTrash } from "react-icons/fa6";
import { GiUpgrade } from "react-icons/gi";
import { useSignal } from "@preact/signals";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { GenProvider } from "@/contexts/GenContext";
import { PokemonUnit } from "@/db/PokemonUnit";
import { DatabaseError, SetValidationError } from "@/errors";
import { getGenealogies, tracePokemon } from "@/utils/pkmnUtils";
import { importFromObject, type PokemonSet } from "@/utils/setUtils";
import { PokemonBigForm, type PokemonBigFormInputs } from "./PokemonBigForm";
import { createPortal } from "preact/compat";
import { SelectEvoModal } from "../SelectEvoModal";

function findMessage(obj: any): string | undefined {
  for (const entry of Object.values<any>(obj)) {
    if (entry.message) return entry.message;
    
    if (typeof entry === "object") {
      const found = findMessage(entry);
      if (found) return found;
    }
  }
}

export function EditPokemonForm({
  unit, pkmn: initialPkmn, close
}: { unit: IPokemonUnit, pkmn: PokemonSet, close: () => void }) {
  const formHook = useForm<PokemonBigFormInputs>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      name: initialPkmn.name,
      happiness: initialPkmn.isGen(2) ? initialPkmn.happiness : undefined,
      ability: (initialPkmn.isGen(3) && initialPkmn.data.ability.name) || undefined,
      gender: (initialPkmn.isGen(2) && initialPkmn.gender) || "N",
      item: (initialPkmn.isGen(2) && initialPkmn.data.item?.name) || undefined,
      shiny: (initialPkmn.isGen(2) && initialPkmn.shiny) || false,

      pokeball: (initialPkmn.isGen(3) && initialPkmn.pokeball) || undefined,
      hpType: (initialPkmn.isGen(7) && initialPkmn.hpType) || "",
      dynamaxLevel: initialPkmn.isGen(8) ? initialPkmn.dynamaxLevel : undefined,
      gigantamax: (initialPkmn.isGen(8) && initialPkmn.gigantamax) || false,
      teraType: (initialPkmn.isGen(9) && initialPkmn.teraType) || "",
      
      level: initialPkmn.level,
      nature: (initialPkmn.isGen(3) && initialPkmn.nature) || "",
  
      ivs: {
        hp: initialPkmn.ivs?.hp,
        atk: initialPkmn.ivs?.atk,
        def: initialPkmn.ivs?.def,
        spa: initialPkmn.ivs?.spa,
        spd: initialPkmn.ivs?.spd,
        spe: initialPkmn.ivs?.spe,
      },
      evs: {
        hp: initialPkmn.evs?.hp,
        atk: initialPkmn.evs?.atk,
        def: initialPkmn.evs?.def,
        spa: initialPkmn.evs?.spa,
        spd: initialPkmn.evs?.spd,
        spe: initialPkmn.evs?.spe,
      },
  
      move: [
        initialPkmn.data.moves?.[0].name,
        initialPkmn.data.moves?.[1]?.name,
        initialPkmn.data.moves?.[2]?.name,
        initialPkmn.data.moves?.[3]?.name,
      ],
    },
  });

  const { handleSubmit, setError, setValue, watch, formState: { errors, isSubmitting } } = formHook;

  const showModal = useSignal(false);
  const isDeleting = useSignal(false);
  const pkmn = useSignal(initialPkmn);
  
  const generation = pkmn.value.gen;
  const gender = watch("gender");

  const genealogies = getGenealogies(pkmn.value.data.species.name, pkmn.value.data.main) ?? [];
  
  const nextEvos = Array.from(new Set(genealogies
    .map((genealogy) => genealogy[genealogy.indexOf(pkmn.value.data.species.name) + 1])
    .filter((evo) => {
      if (!evo) return false;
      const evoData = pkmn.value.data.main.species.get(evo)!;
      return !evoData.gender || !gender || evoData.gender === gender;
    })));
  
  const evolve = (evo: SpeciesName) => {
    const newSet = pkmn.value.toObject();
    newSet.species = evo;
    
    const abilitySlot = Object.entries(pkmn.value.data.species.abilities)
      .find((([_k, v]) => pkmn.value.isGen(3) && pkmn.value.data.ability.name === v))?.[0] as keyof Specie["abilities"] | undefined;

    if (abilitySlot !== undefined) newSet.ability = pkmn.value.data.main.species.get(evo!)?.abilities[abilitySlot];

    pkmn.value = importFromObject(newSet, pkmn.value.gen);
    setValue("ability", newSet.ability);
  };

  const onEvolve = () => {
    if (nextEvos.length === 1) return evolve(nextEvos[0]);
    showModal.value = true;
  };

  const onDelete = async () => {
    if (confirm(`Are you sure you want to delete ${pkmn.value.name ?? pkmn.value.data.species.name}?`)) {
      isDeleting.value = true;
      await PokemonUnit.delete(unit.id);
  
      close();
    }
  };

  const onSubmit: SubmitHandler<PokemonBigFormInputs> = async (values) => {
    const moves: string[] = [];
    
    if (values.move) for (const move of values.move) {
      if (!move) break;
      moves.push(move);
    }

    const minimal: MinimalSet = {
      name: values.name || undefined,
      species: pkmn.value.data.species.name,
      item: values.item || undefined,
      ability: values.ability || undefined,
      nature: values.nature || undefined,
      gender: values.gender === "N" ? undefined : (values.gender || undefined),
      level: !isNaN(values.level!) && values.level || undefined,
      shiny: values.shiny || undefined,
      happiness: !isNaN(values.happiness!) && values.happiness || undefined,
      pokeball: values.pokeball || undefined,
      hpType: values.hpType || undefined,
      dynamaxLevel: !isNaN(values.dynamaxLevel!) && values.dynamaxLevel || undefined,
      gigantamax: values.gigantamax || undefined,
      teraType: values.teraType || undefined,
      
      evs: {
        hp: !isNaN(values.evs?.hp!) && values.evs?.hp || undefined,
        atk: !isNaN(values.evs?.atk!) && values.evs?.atk || undefined,
        def: !isNaN(values.evs?.def!) && values.evs?.def || undefined,
        spa: !isNaN(values.evs?.spa!) && values.evs?.spa || undefined,
        spd: !isNaN(values.evs?.spd!) && values.evs?.spd || undefined,
        spe: !isNaN(values.evs?.spe!) && values.evs?.spe || undefined,
      },
      ivs: {
        hp: !isNaN(values.ivs?.hp!) && values.ivs?.hp || undefined,
        atk: !isNaN(values.ivs?.atk!) && values.ivs?.atk || undefined,
        def: !isNaN(values.ivs?.def!) && values.ivs?.def || undefined,
        spa: !isNaN(values.ivs?.spa!) && values.ivs?.spa || undefined,
        spd: !isNaN(values.ivs?.spd!) && values.ivs?.spd || undefined,
        spe: !isNaN(values.ivs?.spe!) && values.ivs?.spe || undefined,
      },

      moves,
    };

    const groupings = tracePokemon(pkmn.value.data.species.name, pkmn.value.data.main);
    const [species, form] = groupings.length === 1 ? groupings[0] : ["", ""] as const;
    
    try {
      await PokemonUnit.update(unit.id, { species, form, data: minimal });

      // Form is auto-closed by cache clear
    } catch (err) {
      if (err instanceof SetValidationError) {
        setError("name", {
          type: "setValidation",
          message: err.message,
        });
      } else if (err instanceof DatabaseError) {
        setError("name", {
          type: "database",
          message: err.message,
        });
      } else {
        throw err;
      }
    }
  }

  const errorMessage = findMessage(errors);

  return (
    <form
      onSubmit={ handleSubmit(onSubmit) }
      class="min-w-0 flex flex-col gap-2"
    >
      {errorMessage && <p class="text-sm text-center text-red-500">
        {errorMessage}
      </p>}

      <fieldset
        class="min-w-0 flex justify-center items-center"
        disabled={ isDeleting.value || isSubmitting }
      >
        <GenProvider gen={ generation }>
          <FormProvider {...formHook}>
            <PokemonBigForm
              base={ pkmn.value }
              formHook={ formHook }
              buttons={<>
                <button
                  type="button"
                  class="flex cursor-pointer hover:brightness-125"
                  onClick={ close }
                >
                  <FaCircleArrowLeft title="Go back" />
                </button>
                { nextEvos.length > 0 && (<button
                  type="button"
                  class="flex cursor-pointer hover:brightness-125"
                  onClick={ onEvolve }
                >
                  <GiUpgrade title="Evolve" />
                </button>) }
                <button
                  type="submit"
                  class="flex cursor-pointer hover:brightness-125"
                >
                  <FaFloppyDisk title="Save" />
                </button>
                <button
                  type="button"
                  class="flex cursor-pointer hover:brightness-125"
                  onClick={ onDelete }
                >
                  <FaTrash title="Delete" />
                </button>
              </>}
            />
          </FormProvider>
        </GenProvider>
      </fieldset>
      { showModal.value && createPortal(<SelectEvoModal
        close={ () => showModal.value = false }
        evos={ nextEvos }
        select={ evolve }
      />, document.body)}
    </form>
  )
}
