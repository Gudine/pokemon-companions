import { createContext } from "preact";
import { PropsWithChildren } from "preact/compat";

interface IGenContext {
  gen: number | string;
}

const defaultValue: IGenContext = { gen: 9 };

export const GenContext = createContext<IGenContext>(defaultValue);

export function GenProvider({ gen, children }: PropsWithChildren<Partial<IGenContext>>) {
  return (
    <GenContext value={{ gen: gen ?? defaultValue.gen }}>
      {children}
    </GenContext>
  )
}
