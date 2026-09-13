// ============================================
// CONFIGURATION & INITIALISATION
// ============================================

const CONFIG = {
  chapitresUrl: '../assets/json/Ph-Ch_exo-chapitres.json',
  themesUrl: '../assets/json/Ph-Ch_exo-themes.json',
  exercicesBasePath: '../assets/json/Exercices/'
};

const LIBELLES_NIVEAUX = {
  '4e': 'Quatrième',
  '3e': 'Troisième'
};

let donnees = {
  chapitres: [],
  themes: [],
  categories: [],
  exercices: {},
  exercicesCourants: null
};

let etatUI = {
  chapitreActif: null,
  activiteActive: null,
  tagActif: null,
  themeActif: null
};

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================

async function chargerDonnees() {
  try {
    // Charger chapitres
    const resChapitre = await fetch(CONFIG.chapitresUrl);
    donnees.chapitres = await resChapitre.json();

    // Charger thèmes et catégories
    const resThemes = await fetch(CONFIG.themesUrl);
    const dataThemes = await resThemes.json();
    donnees.categories = dataThemes.categories;
    donnees.themes = dataThemes.themes;

    afficherChapitres();
  } catch (error) {
    console.error('Erreur chargement données:', error);
    document.getElementById('app').innerHTML = '<p style="color: red;">Erreur chargement application</p>';
  }
}

// ============================================
// AFFICHAGE CHAPITRES
// ============================================

function afficherChapitres() {
  const container = document.getElementById('chapitres-container');
  container.innerHTML = '';

  const groupes = {};
  donnees.chapitres.forEach((chapitre, index) => {
    const niveau = chapitre.niveau || '';
    if (!groupes[niveau]) groupes[niveau] = [];
    groupes[niveau].push({ chapitre, index });
  });

  const niveauxDeBase = ['4e', '3e', ''];
  const ordreNiveaux = niveauxDeBase
    .filter(niveau => groupes[niveau])
    .concat(Object.keys(groupes).filter(niveau => !niveauxDeBase.includes(niveau)));

  ordreNiveaux.forEach(niveau => {
    const titreGroupe = document.createElement('h3');
    titreGroupe.className = 'titre-groupe-niveau';
    titreGroupe.textContent = LIBELLES_NIVEAUX[niveau] || niveau || 'Autres chapitres';
    container.appendChild(titreGroupe);

    const grille = document.createElement('div');
    grille.className = 'grille-chapitres';

    groupes[niveau].forEach(({ chapitre, index }) => {
      const div = document.createElement('div');
      div.className = 'chapitre-card';
      if (chapitre.couleur) div.style.setProperty('--accent', chapitre.couleur);
      const logoHtml = chapitre.logo
        ? `<img src="${chapitre.logo}" alt="" class="chapitre-logo" onerror="this.style.display='none'">`
        : '';
      div.innerHTML = `
        ${logoHtml}
        <h3>${chapitre.titre}</h3>
        <p class="chapitre-desc">${chapitre.description || ''}</p>
      `;
      div.addEventListener('click', () => selectionnerChapitre(index));
      grille.appendChild(div);
    });

    container.appendChild(grille);
  });
}

// ============================================
// SÉLECTION CHAPITRE
// ============================================

function selectionnerChapitre(indexChapitre) {
  etatUI.chapitreActif = indexChapitre;
  etatUI.activiteActive = null;
  etatUI.tagActif = null;
  etatUI.themeActif = null;

  const chapitre = donnees.chapitres[indexChapitre];

  document.getElementById('chapitres-container').style.display = 'none';
  document.getElementById('activites-container').style.display = 'block';
  document.getElementById('tags-container').style.display = 'none';
  document.getElementById('themes-container').style.display = 'none';
  document.getElementById('exercice-container').style.display = 'none';

  afficherActivites(chapitre.activites);
  afficherBoutonRetour('retour-depuis-activites', () => retournerAuChapitres());
}

// ============================================
// AFFICHAGE ACTIVITÉS
// ============================================

function afficherActivites(activites) {
  const container = document.getElementById('activites-container');
  container.innerHTML = '';

  activites.forEach((activite, index) => {
    const div = document.createElement('div');
    div.className = 'activite-card';
    div.innerHTML = `
      <h3>${activite.titre}</h3>
      <p>${activite.description || ''}</p>
    `;
    div.addEventListener('click', () => selectionnerActivite(index, activite));
    container.appendChild(div);
  });
}

// ============================================
// SÉLECTION ACTIVITÉ
// ============================================

async function selectionnerActivite(indexActivite, activite) {
  etatUI.activiteActive = indexActivite;
  etatUI.tagActif = null;
  etatUI.themeActif = null;

  document.getElementById('activites-container').style.display = 'none';
  document.getElementById('tags-container').style.display = 'block';
  document.getElementById('themes-container').style.display = 'none';
  document.getElementById('exercice-container').style.display = 'none';

  await chargerExercicesCourants();
  afficherTags();
  afficherBoutonRetour('retour-depuis-tags', () => retournerAuxActivites());
}

// ============================================
// AFFICHAGE TAGS (CATÉGORIES)
// ============================================

function afficherTags() {
  const container = document.getElementById('tags-container');
  container.innerHTML = '<h2>Choisir une catégorie :</h2>';

  const tagsDiv = document.createElement('div');
  tagsDiv.className = 'tags-list';

  donnees.categories.forEach(categorie => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = categorie.nom;
    btn.addEventListener('click', () => selectionnerTag(categorie.id));
    tagsDiv.appendChild(btn);
  });

  container.appendChild(tagsDiv);
}

// ============================================
// SÉLECTION TAG (CATÉGORIE)
// ============================================

function selectionnerTag(tagId) {
  etatUI.tagActif = tagId;
  etatUI.themeActif = null;

  document.getElementById('tags-container').style.display = 'none';
  document.getElementById('themes-container').style.display = 'block';
  document.getElementById('exercice-container').style.display = 'none';

  afficherThemes(tagId);
  afficherBoutonRetour('retour-depuis-themes', () => retournerAuxTags());
}

// ============================================
// AFFICHAGE THÈMES FILTRÉS PAR TAG
// ============================================

function afficherThemes(tagId) {
  const container = document.getElementById('themes-container');
  container.innerHTML = `<h2>Choisir un thème :</h2>`;

  // Filtrer les thèmes du tag cliqué qui disposent d'un exercice pour ce chapitre/activité, puis tri alphabétique
  const themesFiltrés = donnees.themes
    .filter(theme => theme.tags.includes(tagId))
    .filter(theme => !donnees.exercicesCourants || trouverExercice(donnees.exercicesCourants, theme.nom))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));

  if (themesFiltrés.length === 0) {
    container.insertAdjacentHTML('beforeend', '<p class="message">Aucun exercice disponible pour cette catégorie dans cette activité.</p>');
    return;
  }

  const themesDiv = document.createElement('div');
  themesDiv.className = 'themes-grid';

  themesFiltrés.forEach((theme, index) => {
    const card = document.createElement('div');
    card.className = 'theme-card';
    
    // Construire le chemin du logo (placeholder ou vrai fichier)
    const logoPath = `../assets/images/themes/${theme.nom.toLowerCase().replace(/\s+/g, '-')}.png`;

    card.innerHTML = `
      <img src="${logoPath}" alt="${theme.nom}" class="theme-logo" onerror="this.onerror=null;this.src='../assets/images/themes/default.svg'">
      <h3>${theme.nom}</h3>
    `;

    card.addEventListener('click', () => selectionnerTheme(theme.nom));
    themesDiv.appendChild(card);
  });

  container.appendChild(themesDiv);
}

// ============================================
// SÉLECTION THÈME & CHARGEMENT EXERCICE
// ============================================

function selectionnerTheme(themeName) {
  etatUI.themeActif = themeName;

  document.getElementById('themes-container').style.display = 'none';
  document.getElementById('exercice-container').style.display = 'block';

  chargerEtAfficherExercice(themeName);
  afficherBoutonRetour('retour-depuis-exercice', () => retournerAuxThemes());
}

// ============================================
// CHARGEMENT & AFFICHAGE EXERCICE
// ============================================

// Normalise un texte pour la comparaison : minuscules, sans accents ni ponctuation.
function normaliserTexte(valeur) {
  return String(valeur || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Retrouve l'exercice correspondant à un thème (tolérant aux accents, à la casse et aux préfixes).
function trouverExercice(exercices, themeName) {
  const cible = normaliserTexte(themeName);
  return exercices.find(ex => {
    const identifiant = normaliserTexte(ex.themeId || ex.theme);
    return identifiant !== '' && (identifiant === cible || identifiant.startsWith(cible) || cible.startsWith(identifiant));
  });
}

// Charge (avec cache) les exercices du chapitre et de l'activité courants.
async function chargerExercicesCourants() {
  donnees.exercicesCourants = null;
  try {
    const chapitre = donnees.chapitres[etatUI.chapitreActif];
    const activite = chapitre.activites[etatUI.activiteActive];
    const fichierJson = `Ph-Ch_exo-${chapitre.id}-${activite.id}.json`;

    if (!donnees.exercices[fichierJson]) {
      const res = await fetch(CONFIG.exercicesBasePath + fichierJson);
      if (!res.ok) throw new Error(`Fichier ${fichierJson} non trouvé`);
      donnees.exercices[fichierJson] = await res.json();
    }

    // Le fichier racine est un objet { chapitreId, activiteId, exercices: [...] }
    const chargeur = donnees.exercices[fichierJson];
    donnees.exercicesCourants = Array.isArray(chargeur) ? chargeur : (chargeur && chargeur.exercices) || [];
  } catch (error) {
    // En cas d'échec de chargement, on garde tous les thèmes visibles.
    console.error('Erreur chargement exercices:', error);
  }
}

async function chargerEtAfficherExercice(themeName) {
  try {
    await chargerExercicesCourants();
    const exercices = donnees.exercicesCourants || [];
    const exercice = trouverExercice(exercices, themeName);

    if (!exercice) {
      afficherExerciceIntrouvable(themeName);
      return;
    }

    afficherExercice(exercice);
  } catch (error) {
    console.error('Erreur chargement exercice:', error);
    document.getElementById('exercice-container').innerHTML = `
      <p style="color: red;">Erreur : exercice non disponible pour ce thème.</p>
    `;
  }
}

// ============================================
// AFFICHAGE EXERCICE AVEC CORRECTION CACHÉE
// ============================================

function afficherExercice(exercice) {
  const container = document.getElementById('exercice-container');

  const correctionId = `correction-${Date.now()}`;
  const contenuCorrection = exercice.reponse || exercice.correction;

  container.innerHTML = `
    <div class="exercice-wrapper">
      <h2>${exercice.titre || exercice.theme || 'Exercice'}</h2>

      <div class="exercice-enonce">
        <h3>Énoncé</h3>
        <p>${exercice.enonce}</p>
      </div>

      <div class="exercice-question">
        <h3>Question</h3>
        <p><strong>${exercice.question}</strong></p>
      </div>

      <div class="exercice-controls">
        <button id="btn-correction" class="btn-correction">
          📖 Afficher la correction
        </button>
      </div>

      ${contenuCorrection ? `<div id="${correctionId}" class="exercice-correction hidden">
        <h3>Correction</h3>
        <p>${contenuCorrection}</p>
      </div>` : ''}
    </div>
  `;

  // Gestion du bouton correction
  const boutonCorrection = document.getElementById('btn-correction');
  const correctionDiv = document.getElementById(correctionId);
  if (!correctionDiv) {
    boutonCorrection.style.display = 'none';
    return;
  }
  boutonCorrection.addEventListener('click', function() {
    correctionDiv.classList.toggle('hidden');
    
    // Changer le texte du bouton selon l'état
    if (correctionDiv.classList.contains('hidden')) {
      this.textContent = '📖 Afficher la correction';
    } else {
      this.textContent = '📖 Masquer la correction';
    }
  });
}

function afficherExerciceIntrouvable(themeName) {
  const container = document.getElementById('exercice-container');
  container.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <p style="font-size: 16px; color: #666;">
        Pas d'exercice disponible pour le thème « <strong>${themeName}</strong> » pour cette activité.
      </p>
      <p style="font-size: 14px; color: #999; margin-top: 10px;">
        Revenez en arrière et choisissez un autre thème.
      </p>
    </div>
  `;
}

// ============================================
// NAVIGATION (BOUTONS RETOUR)
// ============================================

function masquerBoutonsRetour() {
  document.querySelectorAll('.btn-retour').forEach(bouton => {
    bouton.style.display = 'none';
  });
}

function afficherBoutonRetour(id, callback) {
  masquerBoutonsRetour();
  let btn = document.getElementById(id);
  if (!btn) {
    btn = document.createElement('button');
    btn.id = id;
    btn.className = 'btn-retour';
    btn.textContent = '← Retour';
    document.body.insertBefore(btn, document.body.firstChild);
  }
  btn.style.display = '';
  btn.onclick = callback;
}

function retournerAuChapitres() {
  etatUI.chapitreActif = null;
  etatUI.activiteActive = null;
  etatUI.tagActif = null;
  etatUI.themeActif = null;

  document.getElementById('chapitres-container').style.display = 'block';
  document.getElementById('activites-container').style.display = 'none';
  document.getElementById('tags-container').style.display = 'none';
  document.getElementById('themes-container').style.display = 'none';
  document.getElementById('exercice-container').style.display = 'none';

  masquerBoutonsRetour();
}

function retournerAuxActivites() {
  etatUI.tagActif = null;
  etatUI.themeActif = null;

  document.getElementById('activites-container').style.display = 'block';
  document.getElementById('tags-container').style.display = 'none';
  document.getElementById('themes-container').style.display = 'none';
  document.getElementById('exercice-container').style.display = 'none';

  afficherBoutonRetour('retour-depuis-activites', () => retournerAuChapitres());
}

function retournerAuxTags() {
  etatUI.themeActif = null;

  document.getElementById('tags-container').style.display = 'block';
  document.getElementById('themes-container').style.display = 'none';
  document.getElementById('exercice-container').style.display = 'none';

  afficherBoutonRetour('retour-depuis-tags', () => retournerAuxActivites());
}

function retournerAuxThemes() {
  document.getElementById('themes-container').style.display = 'block';
  document.getElementById('exercice-container').style.display = 'none';

  afficherBoutonRetour('retour-depuis-themes', () => retournerAuxTags());
}

// ============================================
// LANCEMENT APPLICATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  chargerDonnees();
});