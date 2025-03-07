import { Sprites } from "@pkmn/img";
import { useMemo } from "preact/hooks";

export function Placeholder() {
  const image = useMemo(() => Sprites.getSubstitute({
    gen: "gen5",
    protocol: window.location.protocol.slice(0, -1) as "http" | "https",
    domain: window.location.host,
  }), []);

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
