import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import fetch from "node-fetch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://pokeapi.co/api/v2";

const getGen = (species) => Number(species.generation.url.split("/")[6]);

(async () => {
  const formBlocklist = JSON.parse(await fs.readFile(path.join(__dirname, "formBlocklist.json")));
  const speciesBaseList = await fetch(`${BASE_URL}/pokemon-species/?limit=100000`).then((res) => res.json())
  const speciesUrls = speciesBaseList.results.map((elem) => elem.url);
  
  const speciesList = [];
  
  for (const url of speciesUrls) {
    const newSpecies = await fetch(url).then((res) => res.json());
    speciesList.push(newSpecies);
    if (newSpecies.id % 50 === 0) console.log(`Fetched species #${newSpecies.id}`);
  }
  
  const speciesByName = speciesList.reduce((acc, curr) => ({ ...acc, [curr.name]: curr }), {});
  
  const removedVarieties = [];
  
  console.log("Fetched species");
  
  for (const currSpecies of speciesList) {
    if (currSpecies.evolves_from_species) {
      const prevSpecies = speciesByName[currSpecies.evolves_from_species.name];
      
      if (getGen(currSpecies) <= getGen(prevSpecies)) {
        prevSpecies.notFinal = true;
      } else {
        prevSpecies.supersededBy = currSpecies.id;
      }
    }
  }
  
  for (const currSpecies of speciesList.filter((species) => !species.notFinal)) {
    currSpecies._forms = [];
    
    for (const variety of currSpecies.varieties) {
      const pkmn = await fetch(variety.pokemon.url).then((res) => res.json());
      let form = null;
      
      for (const formRef of pkmn.forms) {
        const tempForm = await fetch(formRef.url).then((res) => res.json());
        
        if (!tempForm.is_battle_only && !formBlocklist.includes(tempForm.id)) {
          form = tempForm;
          break;
        }
      }
      
      if (form === null) {
        removedVarieties.push(variety);
        continue;
      }
      
      currSpecies._forms.push({
        id: form.id,
        name: form.names.find((name) => name.language.name === "en")?.name
          ?? currSpecies.names.find((name) => name.language.name === "en").name,
        sprites: {
          default: form.sprites.front_default?.split("/").slice(8).join("/"),
          shiny: form.sprites.front_shiny?.split("/").slice(8).join("/"),
        },
      });
    }
      
    if (currSpecies.id % 50 === 0) console.log(`Processed species #${currSpecies.id}`);
  }
  
  await fs.writeFile(
    path.join(__dirname, "..", "src", "assets", "data", "removedVarieties.json"),
    JSON.stringify(removedVarieties, null, 2),
  );
  
  const finalList = speciesList
    .filter((species) => !species.notFinal)
    .map((species) => ({
      id: species.id,
      name: species.names.find((name) => name.language.name === "en").name,
      supersededBy: species.supersededBy ?? null,
      forms: species._forms,
    }));
  
  await fs.writeFile(
    path.join(__dirname, "..", "src", "assets", "data", "pokemonList.json"),
    JSON.stringify(finalList, null, 2),
  );
})();