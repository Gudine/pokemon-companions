export const settings = {
  get smallSpeciesSprites() {
    return localStorage.getItem("smallSpeciesSprites") === "true";
  },
  set smallSpeciesSprites(v) {
    localStorage.setItem("smallSpeciesSprites", String(v));
  },
  get smallPokemonCards() {
    return localStorage.getItem("smallPokemonCards") === "true";
  },
  set smallPokemonCards(v) {
    localStorage.setItem("smallPokemonCards", String(v));
  }
};