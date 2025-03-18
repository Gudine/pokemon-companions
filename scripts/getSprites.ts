import fs from "fs/promises";
import { join, dirname } from "path";
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

const invalidURLs: string[] = [];

async function downloadImage(url: string) {
  const pathname = new URL(url).pathname;
  const outPath = join("public", pathname);

  if (await exists(outPath)) return;
  console.log(`Downloading ${url}...`);

  const fetched = await fetch(url);
  if (!fetched.ok) {
    invalidURLs.push(pathname);
    return;
  }

  const imgData = await fetched.arrayBuffer();

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

fs.writeFile(join("src", "invalidImages.json"), JSON.stringify(invalidURLs));
