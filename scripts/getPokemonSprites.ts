import fs from "fs/promises";
import { join, basename, dirname } from "path";
import { setTimeout as sleep } from "timers/promises";
import { Dex, SpeciesName } from "@pkmn/dex";
import { Sprites } from "@pkmn/img";
import { pokemonList } from "../src/pokemonList";

async function exists(path: string) {
  try {
    await fs.stat(path);
    return true;
  } catch (err) {
    return false;
  }
}

async function downloadImage(name: SpeciesName) {
  const img = Sprites.getPokemon(Dex.species.get(name).name, { gen: "gen5" });
  const outPath = join("public", new URL(img.url).pathname);

  if (basename(img.url) === "0.png") {
    throw new Error(`Image not found for ${name}`);
  }

  if (await exists(outPath)) return;
  console.log(`Downloading ${img.url}...`);

  const imgData = await fetch(img.url).then((res) => res.arrayBuffer());

  await fs.mkdir(dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, Buffer.from(imgData));
  await sleep(100);
}

const doneImages = new Set();

let i = 0;

for (const [name, forms] of pokemonList) {
  console.log(`${i + 1} / ${pokemonList.size}`);
  i += 1;

  if (!doneImages.has(name)) {
    await downloadImage(name);
    doneImages.add(name);
  }

  for (const [formName] of forms) {
    if (!doneImages.has(formName)) {
      await downloadImage(formName);
      doneImages.add(formName);
    }
  }
}
