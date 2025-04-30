---

# 🤖 GANGUI AI

**Gangui** est un bot Minecraft programmable qui peut :  
- Suivre automatiquement les joueurs  
- Répondre à des commandes intelligentes via le chat  
- Être contrôlé manuellement au clavier  
- Générer des réponses via l'API GPT (OpenAI compatible)

---

## ⚙️ Fonctionnalités

- 🧠 Réponses intelligentes grâce à GPT (API compatible OpenAI)
- 🧭 Suivi automatique du joueur le plus proche
- 💬 Commandes personnalisées via le chat Minecraft
- 🎮 Contrôle clavier avec les touches ZQSD/WASD
- 🛠️ Compatible avec `mineflayer` + `mineflayer-pathfinder`

---

## 💬 Commandes en jeu

Préfixe à utiliser : `@ai`

| Commande Minecraft              | Effet                                         |
|-------------------------------|----------------------------------------------|
| `@ai follow me`               | Le bot suit le joueur                        |
| `@ai follow <pseudo>`         | Le bot suit un autre joueur                  |
| `@ai stop following`          | Le bot arrête de suivre                      |
| `@ai <question ou message>`   | Envoie le message à GPT pour obtenir une réponse |

---

## 🧑‍💻 Contrôle clavier

Dans le terminal (après le démarrage du bot) :

- `Z` / `Q` / `S` / `D` : Déplacement manuel
- `F` : Activer/désactiver le mode *auto-follow*
- `Ctrl+C` : Quitter le bot

---

## 🚀 Installation

1. **Clone du repo :**

```bash
git clone https://github.com/ton-utilisateur/ganguibot.git
cd ganguibot
```

2. **Installation des dépendances :**

```bash
npm install
```

3. **Configuration de l'API :**

Créer un fichier `.env` à la racine :

```
GITHUB_TOKEN=ta_clé_api_gpt
```

> Remplace par ta clé API OpenAI ou Azure Inference compatible.

---

## 🟢 Lancement

```bash
node bot.js
```

---

## 🛠️ Dépendances principales

- [`mineflayer`](https://github.com/PrismarineJS/mineflayer)
- [`mineflayer-pathfinder`](https://github.com/PrismarineJS/mineflayer-pathfinder)
- [`openai`](https://www.npmjs.com/package/openai)
- `dotenv`, `readline`

---

## 🧠 Modèle utilisé

Ce bot utilise le modèle `gpt-4o-mini`, paramétrable dans le code via :

```js
model: "gpt-4o-mini"
```

---

## 📄 Licence

Ce projet est open-source, publié sous licence GNU.

---
