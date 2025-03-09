import type { Generation, GenerationNum } from "@pkmn/data";
import { createContext } from "preact";
import { PropsWithChildren } from "preact/compat";
import { defaultGen, gens } from "../data";

interface IGenContext {
  gen: GenerationNum;
  data: Generation;
}

const defaultValue: IGenContext = { gen: defaultGen.num, data: defaultGen };

export const GenContext = createContext<IGenContext>(defaultValue);

export function GenProvider({ gen, data, children }: PropsWithChildren<Partial<IGenContext>>) {
  return (
    <GenContext value={{
      gen: gen ?? data?.num ?? defaultValue.gen,
      data: data ?? (gen ? gens.get(gen) : defaultValue.data),
    }}>
      {children}
    </GenContext>
  )
}
