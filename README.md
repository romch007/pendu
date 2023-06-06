# Pendu

Jouer au pendu en ligne. Le site est disponible ici [here](https://puceaulytech.fr/pendu-romain).

Je n'ai pas connecté le pendu à l'[API](https://github.com/romch007/pendu-prof) car les animations ont besoin d'avoir le mot côté client (animation pour savoir si la lettre a déjà été entré, et plein autre galères...). De plus, j'utilise une balise script `<script type="module">` qui empêche de pouvoir lire les variables du programme dans la console, la problématique qui est sensé être adressée par le serveur est déjà réglée ici. On peut quand même jouer au pendu avec l'API avec `curl` par exemple.

Installer les dépendances:

```
yarn
```

Lancer le pendu:

```bash
yarn dev
```
