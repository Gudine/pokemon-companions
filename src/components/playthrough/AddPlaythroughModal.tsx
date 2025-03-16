import type { GenerationNum } from "@pkmn/data";
import type { IPlaythrough } from "@/db/db";
import { AiOutlineLoading } from "react-icons/ai";
import { Playthrough } from "@/db/Playthrough";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { DatabaseError } from "@/errors";

const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

interface Inputs {
  name: string,
  date: Date,
  gen: GenerationNum,
}

export function AddPlaythroughModal({ close, playthrough }: { close: () => void, playthrough?: IPlaythrough }) {
  const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid } } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: {
      name: playthrough?.name,
      date: playthrough?.date.toISOString().slice(0, 10) as unknown as Date,
      gen: playthrough?.gen ?? GENS[GENS.length - 1],
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async ({ name, date, gen }) => {
    if (playthrough) {
      await Playthrough.update(playthrough.id, { name, date });
  
      close();
    } else {
      try {
        await Playthrough.add(
          name,
          date,
          gen,
        );
  
        close();
      } catch (err) {
        if (err instanceof DatabaseError) {
          setError("name", {
            type: "database",
            message: "Name already exists",
          });
        }
      }
    }
  }

  return (
    <Modal close={ close } class="w-80 h-100">
      <form
        onSubmit={ handleSubmit(onSubmit) }
        class="w-full h-full flex flex-col justify-around"
      >
        <p class="text-xl font-bold text-center">
          {playthrough ? "Edit playthrough" : "Add new playthrough"}
        </p>

        <label class="flex flex-col">
            Name:
          <input
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              pt-1 pb-1 pl-2 pr-2
            disabled:bg-gray-300 text-stone-700"
            type="text"
            disabled={ isSubmitting }
            {...register("name", {
              required: "Name can't be empty",
            })}
          />
          <p class="text-sm text-red-500 empty:before:inline-block">
            {errors.name?.message ?? ""}
          </p>
        </label>
        <label class="flex flex-col">
          Date:
          <input
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              pt-1 pb-1 pl-2 pr-2
            disabled:bg-gray-300 text-stone-700"
            type="date"
            disabled={ isSubmitting }
            {...register("date", {
              valueAsDate: true,
              required: "Date must be set",
            })}
          />
          <p class="text-sm text-red-500 empty:before:inline-block">
            {errors.date?.message ?? ""}
          </p>
        </label>
        <label class="flex flex-col">
          Generation:
          <select
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              pt-1 pb-1 pl-2 pr-2
            disabled:bg-gray-300 text-stone-700"
            disabled={ !!playthrough || isSubmitting }
            {...register("gen", { valueAsNumber: true })}
          >
            {GENS.map((genId) => <option value={genId}>{genId}</option>)}
          </select>
        </label>
        <Button class="self-end" type="submit" disabled={!(isValid || isSubmitting)}>
          { !isSubmitting
            ? "Submit"
            /* @ts-expect-error */
            : <AiOutlineLoading className="animate-spin" /> }
        </Button>
      </form>
    </Modal>
  )
}
