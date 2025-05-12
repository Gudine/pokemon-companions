import type { FunctionComponent } from "preact";
import { createCallable as _createCallable } from "react-call";

const roots: FunctionComponent[] = [];

export function createCallable<Props = void, Response = void>(...props: Parameters<typeof _createCallable<Props, Response>>) {
  const result = _createCallable<Props, Response>(...props);
  roots.push(result.Root);
  return result;
}

export function CallableRoots() {
  return roots.map((Root) => <Root />);
}