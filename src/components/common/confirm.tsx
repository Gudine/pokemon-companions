import type { ComponentChild } from "preact";
import { Modal } from "@/components/common/Modal";
import { Button, type ButtonColor } from "@/components/common/Button";
import { createCallable } from "@/utils/callUtils";

interface ButtonData {
  text: ComponentChild,
  color?: ButtonColor,
  value: boolean,
}

type Props = {
  prompt: ComponentChild,
  leftButton?: ButtonData,
  rightButton?: ButtonData,
};

export const confirm = createCallable<Props, boolean | void>(({ call, prompt, leftButton, rightButton }) => {
  return (
    <Modal close={ () => call.end() } class="min-w-80" priority={10}>
      <div class="p-4 w-full h-full flex flex-col justify-around gap-8 grow">
        <p class="text-lg text-center">
          {prompt}
        </p>

        <div class="px-2 grid grid-cols-2 gap-4">
          <Button
            type="button"
            color={leftButton?.color}
            onClick={() => call.end(leftButton?.value ?? true)}
          >
            {leftButton?.text ?? "OK"}
          </Button>
          <Button
            type="button"
            color={rightButton?.color ?? "gray"}
            onClick={() => call.end(rightButton?.value ?? false)}
          >
            {rightButton?.text ?? "Cancel"}
          </Button>
        </div>
      </div>
    </Modal>
  )
});