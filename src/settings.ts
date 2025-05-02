export const settings = {
  get smallPokemonSprites() {
    return localStorage.getItem("smallPokemonSprites") === "true";
  },
  set smallPokemonSprites(v) {
    localStorage.setItem("smallPokemonSprites", String(v));
  }
};