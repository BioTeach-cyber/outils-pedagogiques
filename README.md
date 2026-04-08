# outils-pedagogiques
Outils interactifs pour mes cours

# Portail des applications pédagogiques

## Ajouter une application

Ouvrir le fichier `applications.json` et ajouter un bloc :

```json
{
  "id":           "matiere-sujet-numero",
  "titre":        "Titre affiché sur la carte",
  "description":  "Une phrase courte décrivant l'application.",
  "matiere":      "Biologie",
  "module":       "S1 - Le vivant",
  "theme":        "La cellule",
  "niveaux":      ["4ème", "3ème"],
  "tags":         ["mot-clé 1", "mot-clé 2"],
  "url":          "dossier/sous-dossier/index.html",
  "emoji":        "🔬",
  "statut":       "publié",
  "date_creation":"2025-01",
  "auteur":       "Votre nom"
}


Valeurs autorisées
matiere

Biologie · Ecologie · Biologie Humaine · Physique-Chimie
Informatique · SNT · TIM · ESF
niveaux

4ème · 3ème · CAPa SAPVER · Bac Pro SAPAT
statut

    publié → visible sur le portail
    brouillon → invisible, en cours de création
    archivé → invisible, conservé pour mémoire
