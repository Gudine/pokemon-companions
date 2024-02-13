import fs from "fs";
import { execSync } from "child_process";

fs.rmSync("public/sprites", { force: true, recursive: true });

execSync("git clone -n --depth=1 --filter=tree:0 https://github.com/PokeAPI/sprites.git .temp")
execSync([
  "git sparse-checkout set --no-cone",
  "sprites/pokemon/* !sprites/pokemon/**/",
  // "sprites/pokemon/female/*",
  "sprites/pokemon/shiny/* !sprites/pokemon/shiny/**/",
  // "sprites/pokemon/shiny/female/*",
].join(" "), { cwd: ".temp" });
execSync("git checkout", { cwd: ".temp" });

fs.renameSync(".temp/sprites/pokemon", "public/sprites");
fs.rmSync(".temp", { recursive: true });