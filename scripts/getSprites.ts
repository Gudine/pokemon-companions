import fs from "fs/promises";
import { join, basename, dirname } from "path";
import { setTimeout as sleep } from "timers/promises";
import { SpeciesName } from "@pkmn/data";
import { Sprites, Icons } from "@pkmn/img";
import { defaultGen } from "../src/data";

async function exists(path: string) {
  try {
    await fs.stat(path);
    return true;
  } catch (err) {
    return false;
  }
}

async function downloadImage(url: string) {
  const outPath = join("public", new URL(url).pathname);

  if (basename(url) === "0.png") {
    throw new Error("Image not found");
  }

  if (await exists(outPath)) return;
  console.log(`Downloading ${url}...`);

  const imgData = await fetch(url).then((res) => res.arrayBuffer());

  await fs.mkdir(dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, Buffer.from(imgData));
  await sleep(100);
}

async function downloadImages(name: SpeciesName) {
  const species = defaultGen.species.get(name)!;

  try {
    await downloadImage(Sprites.getPokemon(species.name, { gen: "gen5" }).url);
    await downloadImage(Sprites.getPokemon(species.name, { gen: "gen5", shiny: true }).url);
    await downloadImage(Icons.getPokemon(species.name).url)
    
    if (!species.gender) for (const gender of ["M", "F"] as const) {
      await downloadImage(Sprites.getPokemon(species.name, { gen: "gen5", gender }).url);
      await downloadImage(Sprites.getPokemon(species.name, { gen: "gen5", gender, shiny: true }).url);
      await downloadImage(Icons.getPokemon(species.name, { gender }).url);
    }
  } catch (err) {
    throw new Error(`Image not found for ${name}`);
  }
}

for (const species of defaultGen.species) {
  await downloadImages(species.name);
}

for (const item of defaultGen.items) {
  await downloadImage(Icons.getItem(item.name).url);
}

await downloadImage(Sprites.getSubstitute({ gen: "gen5" }).url);
