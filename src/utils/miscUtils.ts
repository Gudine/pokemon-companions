// Source: https://math.stackexchange.com/a/107254
const LOGGINESS = 0.65;

export const graphFunctionBuilder = (length: number) => (x: number) => {
  const v = Math.min(length, Math.max(0, x));

  return (((v + 1) ** LOGGINESS - 1) / ((length + 1) ** LOGGINESS - 1));
};

export function batched<T>(arr: T[], n: number): T[][] {
  if (n < 1) throw new Error("n must be at least one");

  const result: T[][] = [];

  for (let i = 0; i < arr.length; i += 1) {
    const element = arr[i];
    const index = Math.floor(i / n);
    if (!result[index]) result.push([]);
    result[index].push(element);
  }
  
  return result;
}