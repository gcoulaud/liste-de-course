# Configuration Firebase (partage foyer)

## 1) Créer le projet Firebase
1. Va sur Firebase Console.
2. Crée un projet.
3. Active **Firestore Database** en mode **production** (ou test pour démarrer).
4. Dans **Paramètres du projet** > **Vos applications** > **Web**, crée une app web.

## 2) Coller la config Web
Dans `firebase-config.js`, remplace les champs vides:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

## 3) Déployer les règles Firestore
Le fichier `firestore.rules` est prêt.

Si tu utilises la CLI Firebase:

```bash
npm i -g firebase-tools
firebase login
firebase init firestore
# choisis ton projet
# quand demandé pour les rules, utilise firestore.rules
firebase deploy --only firestore:rules
```

## 4) Lancer l'app
```bash
python3 -m http.server 8000
```
Puis ouvre `http://localhost:8000`.

## 5) Partage foyer
- Tous les membres saisissent le **même code foyer** dans le champ en haut.
- La connexion est automatique.
- Les ajouts/suppressions se synchronisent en temps réel.

## Notes sécurité
- Cette version fonctionne **sans login**.
- Utilise un code foyer long (ex: `famille-dupont-2026-x9k2`).
- Toute personne qui connaît ce code peut accéder à la liste de ce foyer.
