import { createContext } from "preact";

interface IGenContext {
  gen: number | string;
}

const defaultValue: IGenContext = { gen: 9 };

export const GenContext = createContext<IGenContext>(defaultValue);
