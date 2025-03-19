import type { Specie } from "@pkmn/data";
import fs from "fs/promises";
import { join, dirname } from "path";
import { setTimeout as sleep } from "timers/promises";
import Sharp from "sharp";
import { Sprites, Icons } from "@pkmn/img";
import { defaultGen } from "../src/data";

const imagesData = new Map<string, Buffer | undefined>();

const plainImages: string[] = [];
const shinyImages: string[] = [];

async function downloadImage(url: string) {
  const pathname = new URL(url).pathname;
  const outPath = join("public", pathname);

  console.log(`Downloading ${url}...`);
  const fetched = await fetch(url);
  if (!fetched.ok) throw new Error(`File ${url} not found`);

  const imgData = await fetched.bytes();

  await fs.mkdir(dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, Buffer.from(imgData));
  await sleep(100);
}

async function getImage(url: string): Promise<string | undefined> {
  const pathname = new URL(url).pathname;
  if (imagesData.has(pathname)) return pathname;

  // Check if file exists in system
  const existingFile = await fs.readFile(join("public", pathname)).catch(() => undefined);
  if (existingFile) {
    imagesData.set(pathname, existingFile);
    return pathname;
  }

  // Download from server
  console.log(`Downloading ${url}...`);
  const fetched = await fetch(url);
  if (!fetched.ok) {
    imagesData.set(pathname, undefined);
    return ;
  }

  imagesData.set(pathname, Buffer.from(await fetched.bytes()));
  return sleep(100, pathname);
}

async function getImages(species: Specie) {
  const plainPath = await getImage(Sprites.getPokemon(species.name, { gen: 5 }).url);
  if (plainPath && !plainImages.includes(plainPath)) plainImages.push(plainPath);

  const shinyPath = await getImage(Sprites.getPokemon(species.name, { gen: 5, shiny: true }).url);
  if (shinyPath && !shinyImages.includes(shinyPath)) shinyImages.push(shinyPath);
  
  if (!species.gender) for (const gender of ["M", "F"] as const) {
    const plainGenderPath = await getImage(Sprites.getPokemon(species.name, { gen: 5, gender }).url);
    if (plainGenderPath && !plainImages.includes(plainGenderPath)) plainImages.push(plainGenderPath);

    const shinyGenderPath = await getImage(Sprites.getPokemon(species.name, { gen: 5, gender, shiny: true }).url);
    if (shinyGenderPath && !shinyImages.includes(shinyGenderPath)) shinyImages.push(shinyGenderPath);
  }
}

for (const species of defaultGen.species) {
  await getImages(species);
}

await downloadImage(Sprites.getSubstitute({ gen: 5 }).url);
await downloadImage(Icons.getPokemon("Zubat").url);
await downloadImage(Icons.getItem("Potion").url);

// -----------------------------------------------
const GRID_WIDTH = 40;

const nameToComposite = (plainImage: string, i: number) => {
  const data = imagesData.get(plainImage);
  if (!data) return;

  return {
    input: data,
    left: (i % GRID_WIDTH) * 96,
    top: Math.floor(i / GRID_WIDTH) * 96,
  }
}

await Sharp({ create: {
  width: GRID_WIDTH * 96,
  height: Math.ceil(plainImages.length / GRID_WIDTH) * 96,
  channels: 4,
  background: "#00000000",
} }).composite(plainImages.map(nameToComposite).filter((v) => v !== undefined))
  .webp({ lossless: true }).toFile("public/sprites/pokemon-sheet.webp");

await Sharp({ create: {
  width: GRID_WIDTH * 96,
  height: Math.ceil(shinyImages.length / GRID_WIDTH) * 96,
  channels: 4,
  background: "#00000000",
} }).composite(shinyImages.map(nameToComposite).filter((v) => v !== undefined))
  .webp({ lossless: true }).toFile("public/sprites/pokemonshiny-sheet.webp");

await fs.writeFile(join("src", "imageIndices.json"), JSON.stringify([plainImages, shinyImages]));
