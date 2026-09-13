/*
 * Chargeur de données
 * Ce fichier contient uniquement les fonctions qui lisent les fichiers JSON.
 * Le chemin est relatif à la page HTML : cela fonctionne aussi sur GitHub Pages.
 */

/** Charge un fichier JSON et transforme sa réponse en objet JavaScript. */
async function chargerJson(chemin) {
  const reponse = await fetch(chemin);
  if (!reponse.ok) {
    throw new Error(`Impossible de charger ${chemin} (${reponse.status})`);
  }
  return reponse.json();
}

async function chargerChapitres() {
  return chargerJson('../assets/json/Ph-Ch_exo-chapitres.json');
}

async function chargerThemes() {
  return chargerJson('../assets/json/Ph-Ch_exo-themes.json');
}

/** Charge les exercices correspondant au chapitre et à l’activité choisis. */
async function chargerExercices(chapitreId, activiteId) {
  const chemin = `../assets/json/exercices/Ph-Ch_exo-${chapitreId}-${activiteId}.json`;
  return chargerJson(chemin);
}
