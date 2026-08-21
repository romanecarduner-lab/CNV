# Deux collines

Deux collines — application web de pratique de la communication nonviolente : auto-empathie, empathie, expression, journal quotidien, entraînement et section théorique.

Aucun serveur, aucun compte, aucune mesure d'audience. Les notes sont écrites dans le stockage local du navigateur et n'en sortent jamais.

## Lancer en local

Il faut Node.js 18 ou plus.

```bash
npm install
npm run dev
```

L'app s'ouvre sur `http://localhost:5173`.

## Déployer sur Vercel

### Option A — par le site (la plus simple)

1. Créer un dépôt sur GitHub et y pousser ce dossier.
2. Sur vercel.com : **Add New → Project**, puis importer le dépôt.
3. Vercel détecte Vite tout seul. Vérifier seulement :
   - Framework Preset : **Vite**
   - Build Command : `npm run build`
   - Output Directory : `dist`
4. **Deploy**. Rien à configurer côté variables d'environnement : il n'y en a aucune.

### Option B — en ligne de commande

```bash
npm i -g vercel
vercel          # déploiement de test
vercel --prod   # mise en production
```

## Installer sur un téléphone

L'app est installable sans passer par les stores.

- **iPhone** : ouvrir l'adresse dans Safari → bouton Partager → *Sur l'écran d'accueil*.
- **Android** : ouvrir dans Chrome → menu → *Ajouter à l'écran d'accueil*.

Elle s'ouvre alors en plein écran, sans barre de navigateur.

## Structure

```
index.html                  métadonnées, viewport, thème
src/main.jsx                point d'entrée React
src/App.jsx                 toute l'application (un seul fichier)
public/favicon.svg          icône
public/manifest.webmanifest installation sur l'écran d'accueil
```

Tout tient dans `src/App.jsx` : les données pédagogiques (étapes, vocabulaire, exercices, théorie) sont en haut du fichier, sous forme de tableaux modifiables sans toucher au code. Les styles sont dans la constante `CSS`, en bas.

## Où modifier quoi

| Ce que tu veux changer | Où |
| --- | --- |
| Textes des quatre étapes, exemples, pièges | `ETAPES` |
| Listes de sentiments et de besoins | `SENTIMENTS_MANQUE`, `SENTIMENTS_NOURRI`, `BESOINS` |
| Phrases des exercices | `EXERCICES` |
| Contenu de la section Comprendre | `THEORIE` |
| Mots déclenchant la proposition d'auto-empathie | `MOTS_JUGEMENT`, `FAUX_SENTIMENTS`, `SENTIMENTS_INTENSES` |
| Couleurs et teintes | `T` et `ORIENTATIONS` |
| Mentions légales, confidentialité, propriété | composant `Reglages` et composant `Mentions` |
| Nom, SIRET, adresse de contact, date de mise à jour | constantes en haut de `App.jsx` |

## Limites connues

- Les notes vivent dans le stockage local d'un navigateur donné : elles ne suivent pas d'un appareil à l'autre, et un nettoyage des données du navigateur les efface.
- L'export PDF passe par la fenêtre d'impression du système (« Enregistrer en PDF »). Une version native pourrait générer le fichier directement.
- La proposition de détour par l'auto-empathie repose sur un curseur d'intensité et un repérage de mots-clés. C'est volontairement simple, et donc faillible.

## Mentions

Éditée par Romane Carduner — entrepreneure individuelle, SIRET 844 603 142 00028.
Contact : contact@romanecarduner-psychologue.fr

La Communication NonViolente a été élaborée par Marshall Rosenberg. Cette application n'est ni certifiée, ni affiliée au Center for Nonviolent Communication ni à aucune association de CNV, et ne remplace pas une formation.
