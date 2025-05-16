export const settings = {
  get smallSpeciesSprites() {
    return localStorage.getItem("smallSpeciesSprites") === "true";
  },
  set smallSpeciesSprites(v) {
    localStorage.setItem("smallSpeciesSprites", String(v));
  },
};