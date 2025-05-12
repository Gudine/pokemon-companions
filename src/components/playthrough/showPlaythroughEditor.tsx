import type { GenerationNum } from "@pkmn/data";
import type { IPlaythrough } from "@/db/db";
import { AiOutlineLoading } from "react-icons/ai";
import { Playthrough } from "@/db/Playthrough";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { confirm } from "@/components/common/confirm";
import { useForm, type SubmitHandler } from "react-hook-form";
import { DatabaseError } from "@/errors";
import { useSignal } from "@preact/signals";
import { createCallable } from "@/utils/callUtils";

const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

interface Inputs {
  name: string,
  date: Date,
  gen: GenerationNum,
}

export const showPlaythroughEditor = createCallable<{ playthrough?: IPlaythrough }>(({ call, playthrough }) => {
  const { register, handleSubmit, setError, formState: { isSubmitting, errors, isValid } } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: {
      name: playthrough?.name,
      date: playthrough?.date.toISOString().slice(0, 10) as unknown as Date,
      gen: playthrough?.gen ?? GENS[GENS.length - 1],
    },
  });

  const isDeleting = useSignal(false);

  const onSubmit: SubmitHandler<Inputs> = async ({ name, date, gen }) => {
    if (playthrough) {
      await Playthrough.update(playthrough.id, { name, date });
  
      call.end();
    } else {
      try {
        await Playthrough.add(
          name,
          date,
          gen,
        );
  
        call.end();
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

  const onDelete = async () => {
    if (await confirm.call({
      prompt: <>
        Are you sure you want to delete the "{playthrough!.name}" playthrough?
        <br />
        This will also delete all the Pokémon under this playthrough.
      </>,
      leftButton: {
        text: "Cancel",
        color: "gray",
        value: false,
      },
      rightButton: {
        text: "Delete",
        color: "red",
        value: true,
      }
    })) {
      isDeleting.value = true;
      await Playthrough.delete(playthrough!.id);
  
      call.end();
    }
  };

  return (
    <Modal onClickOutside={ () => call.end() } class="w-80 h-100">
      <form
        onSubmit={ handleSubmit(onSubmit) }
        class="p-4 w-full h-full flex flex-col justify-around grow"
      >
        <p class="text-xl font-bold text-center">
          {playthrough ? "Edit playthrough" : "Add new playthrough"}
        </p>

        <label class="flex flex-col">
            Name:
          <input
            class="bg-gray-100 border-2 border-stone-500 rounded-lg
              px-2 py-1
            disabled:bg-gray-300 text-stone-700"
            type="text"
            disabled={ isSubmitting || isDeleting.value }
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
              px-2 py-1
            disabled:bg-gray-300 text-stone-700"
            type="date"
            disabled={ isSubmitting || isDeleting.value }
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
              px-2 py-1
            disabled:bg-gray-300 text-stone-700"
            disabled={ !!playthrough || isSubmitting || isDeleting.value }
            {...register("gen", { valueAsNumber: true })}
          >
            {GENS.map((genId) => <option value={genId}>{genId}</option>)}
          </select>
        </label>
        <div class={`flex ${playthrough ? "justify-between" : "justify-end"}`}>
          {!!playthrough && <Button
            color="red"
            type="button"
            disabled={!isValid || isSubmitting || isDeleting.value}
            onClick={ onDelete }
          >
            { !isDeleting.value
              ? "Delete"
              /* @ts-expect-error */
              : <AiOutlineLoading className="animate-spin" /> }
          </Button>}
          <Button
            class="self-end"
            type="submit"
            disabled={!isValid || isSubmitting || isDeleting.value}
          >
            { !isSubmitting
              ? "Save"
              /* @ts-expect-error */
              : <AiOutlineLoading className="animate-spin" /> }
          </Button>
        </div>
      </form>
    </Modal>
  )
});
