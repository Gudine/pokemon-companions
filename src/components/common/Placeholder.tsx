import { ImgUtils } from "@/utils/imgUtils";

export function Placeholder() {
  const image = ImgUtils.getSubstitute();

  return (
    <article class="flex flex-col gap-2 items-center text-2xl text-center">
      <div class="flex flex-col items-center">
        <img
          src={ image.url }
          width={ image.w * 2 }
          height={ image.h * 2 }
          alt=""
          style={ { imageRendering: image.pixelated ? "pixelated" : "auto" } }
          class="-m-[25%] pointer-events-none select-none"
        />
      </div>
      <p>
        There's nothing
        <br />
        to be shown here
      </p>
    </article>
  )
}
