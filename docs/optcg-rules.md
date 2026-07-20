# One Piece Card Game — Référence complète des règles

> Document de référence indépendant, synthétisant les règles officielles du One Piece Card Game (basé sur les Règles complètes v1.1.9 et le Manuel des règles officielles publiés par Bandai). Reformulé et réorganisé pour servir de référence de travail — se reporter aux documents officiels pour toute question d'arbitrage en tournoi.

## 1. Vue d'ensemble

Le jeu se joue à deux, en duel — aucune variante à plus de joueurs n'est prévue dans les règles actuelles.

**Conditions de défaite** (la partie se termine dès qu'un joueur remplit l'une de ces deux conditions) :
- Son Leader subit des dégâts alors que sa zone de Vie est déjà vide.
- Son deck principal n'a plus de cartes à piocher.

Un joueur peut aussi abandonner à tout moment ; l'abandon est immédiat, ne peut être déclenché ni empêché par aucun effet de carte, et ne peut pas être annulé par un effet de remplacement. Certaines cartes peuvent également provoquer directement la victoire ou la défaite d'un joueur via leur effet.

**Principes de base à retenir pour l'implémentation :**
- Le texte d'une carte prévaut toujours sur les règles générales en cas de contradiction.
- Une action impossible n'est simplement pas réalisée (partiellement si nécessaire) — le jeu ne bloque jamais sur une instruction irréalisable.
- Si les deux joueurs doivent faire un choix simultané, celui dont c'est le tour choisit en premier.
- La puissance d'une carte peut devenir négative sans que la carte soit déplacée pour autant ; le coût, lui, ne peut être négatif que le temps d'un calcul intermédiaire — il est ramené à 0 en dehors de ce calcul.

## 2. Anatomie d'une carte

Chaque carte possède les caractéristiques suivantes (certaines ne s'appliquent qu'à certaines catégories) :

| Caractéristique | Cartes concernées | Notes |
|---|---|---|
| Nom | Toutes | Certaines cartes tirent leur nom de leur texte plutôt que d'un champ dédié — traité comme un nom par défaut, y compris en construction de deck |
| Catégorie | Toutes | Leader, Personnage, Événement, Lieu, DON!! — détermine la zone de jeu de la carte |
| Couleur | Toutes | 6 couleurs possibles (rouge, vert, bleu, violet, noir, jaune) ; une carte peut en avoir plusieurs (« multicolore »), auquel cas elle est considérée comme possédant chacune de ses couleurs |
| Type | Toutes | Un ou plusieurs types, séparés par `/` sur la carte |
| Attribut | Leader, Personnage uniquement | Tranche, Frappe, Distance, Spécial, Sagesse, ou `?` ; peut être multiple |
| Puissance | Leader, Personnage uniquement | Force au combat, modifiable par des effets |
| Coût | Personnage, Événement, Lieu uniquement | Nombre de DON!! à épuiser pour jouer/activer la carte (le Leader n'a pas de coût) |
| Vie | Leader uniquement | Détermine le nombre de cartes placées dans la zone de Vie en début de partie |
| Contre (symbole) | Personnage uniquement | Boost de puissance activable à l'étape de Contre en défausse la carte depuis la main |
| [Déclenchement] | Toutes (si présent dans le texte) | Effet activable au lieu d'ajouter la carte à la main lors d'un dégât reçu sur la Vie |
| Numéro de carte | Toutes | Sert à la règle de construction de deck (max 4 exemplaires par numéro) |

**Règles de jeu d'une carte selon sa catégorie :**
- **Personnage** : révéler la carte, épuiser un nombre de DON!! redressés égal au coût, puis la jouer.
- **Événement** : révéler la carte, épuiser le coût en DON!!, puis la défausser pour activer son effet (l'activation se fait via la défausse, pas via un séjour en jeu).
- **Lieu** : même procédure que Personnage, mais la carte va en zone de Lieu.

## 3. Les zones de jeu

Neuf zones au total, chaque joueur possédant sa propre instance de chacune : Deck, Deck DON!!, Main, Défausse, zone du Leader, zone de Personnage, zone de Lieu, zone de Coût, zone de Vie. Les quatre premières zones de jeu (Leader, Personnage, Lieu, Coût) forment ensemble ce qu'on appelle « le terrain ».

Le **nombre** de cartes dans n'importe quelle zone est toujours une information publique, consultable à tout moment par les deux joueurs — seul le *contenu* de certaines zones est caché.

| Zone | Visibilité | Particularités |
|---|---|---|
| Deck | Secrète | Face cachée, ordre non consultable ni modifiable par les joueurs |
| Deck DON!! | Ouverte | Face cachée mais contenu/ordre librement consultables et réordonnables par les deux joueurs |
| Main | Secrète (pour l'adversaire) | Le propriétaire consulte et réordonne librement sa propre main |
| Défausse | Ouverte | Face visible, empilée (nouvelles cartes au-dessus), ordre modifiable par le propriétaire |
| Zone du Leader | Ouverte | 1 seule carte, fixe pour toute la partie — ne peut jamais quitter cette zone |
| Zone de Personnage | Ouverte | Jusqu'à 5 cartes, posées redressées par défaut |
| Zone de Lieu | Ouverte | Jusqu'à 1 carte, posée redressée par défaut |
| Zone de Coût | Ouverte | Cartes DON!! redressées par défaut ; consultable et réordonnable librement |
| Zone de Vie | Secrète | Face cachée, ordre non consultable — sauf pour le joueur qui y regarde via un effet spécifique |

**Règles de limite de zone :**
- **5 Personnages maximum.** Pour jouer un 6ᵉ, le joueur révèle la carte, défausse d'abord un Personnage déjà en jeu, puis pose la nouvelle carte. Ce défaussage est un traitement lié aux règles — aucun effet de carte ne peut interférer avec cette étape précise.
- **1 Lieu maximum.** Même principe : jouer une nouvelle carte Lieu implique de défausser l'ancienne avant de poser la nouvelle.

**Règle importante sur le changement de zone** : quand une carte quitte la zone de Personnage ou de Lieu pour une autre zone, elle est traitée comme une **carte entièrement nouvelle** dans sa nouvelle zone — tous les effets qui s'appliquaient à elle disparaissent. Une carte DON!! qui change de zone perd de la même façon tous les effets qui lui étaient attachés.

## 4. Mise en place d'une partie

**Matériel requis par joueur :** exactement 1 carte Leader, un deck de 50 cartes, un deck DON!! de 10 cartes.

**Règles de construction du deck :**
- Le deck (hors Leader) ne peut contenir que des cartes Personnage, Événement et Lieu.
- Seules les couleurs figurant sur le Leader peuvent apparaître dans le deck — toute carte d'une autre couleur est interdite.
- Maximum 4 cartes portant le même numéro de carte.
- Des effets de carte peuvent explicitement modifier ces règles de construction (rare, mais prévu par les règles — traité comme un effet permanent qui remplace la règle par défaut).

**Séquence de préparation, dans l'ordre :**
1. Chaque joueur présente son deck (c'est à ce moment précis que les règles de construction sont vérifiées).
2. Mélange du deck, placé face cachée.
3. Placement du Leader face visible dans sa zone.
4. Détermination du premier/second joueur par un moyen impartial au choix des joueurs (pierre-feuille-ciseaux typiquement) — aucune carte ne peut interférer avec cette étape.
5. Le joueur désigné annonce s'il joue en premier ou en second.
6. Chaque joueur pioche 5 cartes pour sa main de départ. En commençant par le joueur qui joue en premier, chacun peut choisir un mulligan unique : renvoyer toute sa main au deck, remélanger, repiocher 5 cartes neuves.
7. Chaque joueur pioche, depuis le dessus de son deck, un nombre de cartes égal à la valeur de Vie de son Leader, et les place face cachée dans sa zone de Vie (la carte piochée en dernier — donc la plus proche du deck — se retrouve sous la pile de Vie).
8. Le premier joueur commence son tour.

## 5. Déroulement d'un tour

Un tour comprend cinq phases dans cet ordre fixe : **Recharge → Pioche → DON!! → Principale → Fin.**

### Phase de Recharge
1. Les effets valables « jusqu'au début de votre prochain tour » prennent fin.
2. Les effets « au début de votre tour / du tour adverse » s'activent (des deux joueurs).
3. Toutes les cartes DON!! données à des cartes du Leader/Personnage retournent, épuisées, en zone de Coût.
4. Toutes les cartes épuisées du terrain (Leader, Personnage, Lieu, Coût) sont redressées.

### Phase de Pioche
Le joueur actif pioche 1 carte. **Exception : le joueur qui commence la partie ne pioche pas lors de son tout premier tour.**

### Phase DON!!
Placement de 2 cartes DON!! face visible depuis le deck DON!! vers la zone de Coût (1 seule s'il n'en reste qu'une dans le deck DON!!, aucune s'il est vide). **Exception : le joueur qui commence la partie ne place qu'1 seule carte DON!! lors de son tout premier tour.**

### Phase Principale
La phase la plus riche — le joueur actif peut effectuer, dans l'ordre de son choix et autant de fois que souhaité, n'importe laquelle des actions suivantes :
- **Jouer une carte** : poser un Personnage/Lieu ou activer un Événement depuis la main, en payant son coût.
- **Activer un effet** de mot-clé [Principale] ou [Activation : Principale].
- **Donner des DON!!** : attacher une carte DON!! redressée de la zone de Coût sous le Leader ou un Personnage (visible en dessous). Chaque DON!! donné apporte +1000 de puissance à la carte pendant le tour en cours, sans limite de nombre tant que des DON!! redressés sont disponibles. Si la carte qui a reçu des DON!! change de zone, ceux-ci repartent épuisés en zone de Coût.
- **Combat** : déclarer une attaque (détaillé en section 6). **Aucun joueur ne peut attaquer pendant son propre premier tour.**

### Phase de Fin
1. Les effets « fin de votre tour » s'activent (une seule fois chacun).
2. Les effets « pour tout le tour »/« jusqu'à la fin du tour » du joueur actif, puis ceux de l'adversaire, deviennent invalides.
3. Le tour passe à l'adversaire, qui devient le nouveau joueur actif ; la partie enchaîne sur sa phase de Recharge.

## 6. Combat

Pendant la phase Principale, le joueur actif peut épuiser son Leader redressé ou un Personnage redressé pour attaquer le Leader adverse ou un Personnage adverse **épuisé** (jamais un Personnage adverse redressé). Le combat se déroule en 5 étapes séquentielles.

### Étape d'Attaque
1. Le joueur actif épuise sa carte attaquante et déclare l'attaque.
2. Il choisit sa cible (Leader adverse, ou Personnage adverse épuisé).
3. Les effets [En attaquant] / « quand vous attaquez » / [Attaque adverse] s'activent.
4. Si l'attaquant ou la cible change de zone avant la fin de cette étape, le combat saute directement à l'étape Fin du combat.

### Étape de Blocage
1. Le défenseur peut activer **un seul** effet [Bloqueur] parmi ses cartes, en l'épuisant — la carte Bloqueur prend alors la place de la cible originale pour la suite du combat.
2. Les effets [En bloquant] s'activent le cas échéant.
3. Même règle de sortie anticipée si attaquant/cible change de zone.

### Étape de Contre
1. Les effets « quand il est attaqué » du défenseur s'activent.
2. Le défenseur peut, dans l'ordre de son choix et autant de fois que possible :
   - Défausser une carte Personnage ayant un symbole Contre depuis sa main, pour booster la puissance du Leader ou d'un Personnage de la valeur indiquée, pour la durée du combat.
   - Payer le coût et défausser une carte Événement ayant [Contre] pour activer son effet.
3. Même règle de sortie anticipée.

### Étape de Dégâts
Comparaison des puissances finales (attaquant vs cible) :
- **Attaquant ≥ cible → combat gagné.**
  - Cible = Leader : 1 point de dégât infligé. Si la Vie est déjà vide, l'attaquant remporte immédiatement la partie. Sinon, le défenseur ajoute la carte du dessus de sa Vie à sa main — et peut, si cette carte a [Déclenchement], choisir de la révéler pour activer son effet à la place. En cas de dégâts multiples (ex : [Double attaque]), ce cycle se répète une fois par point de dégât.
  - Cible = Personnage : le Personnage est mis KO (déplacé en Défausse).
- **Attaquant < cible → combat perdu**, rien ne se passe.

### Fin du combat
Les effets « à la fin de ce combat » s'activent, les effets « pour tout le combat » deviennent invalides (joueur actif d'abord, puis adversaire), et la partie revient à la phase Principale normale.

## 7. Système d'effets

Les effets de cartes se répartissent en quatre catégories, dont la distinction est essentielle pour comprendre leur comportement :

| Catégorie | Comportement |
|---|---|
| **Effet automatique** | Se déclenche seul, chaque fois que l'événement mentionné se produit (ex : [Jouée], [En attaquant], [En cas de KO], ou toute formulation « quand... »). Si l'événement se répète, l'effet se redéclenche à chaque fois. |
| **Effet d'activation** | Doit être déclenché volontairement par le joueur actif pendant sa phase Principale ([Activation : Principale] ou [Principale] sur une carte Événement). |
| **Effet permanent** | Reste actif en continu tant que ses conditions sont remplies — pas de déclenchement ponctuel. |
| **Effet de remplacement** | Reconnu par la formulation « à la place » — remplace un traitement ou un événement plutôt que de s'y ajouter. Une fois une situation remplacée, elle ne peut plus l'être une seconde fois. |

**Ordre de résolution en cas de simultanéité :**
1. Le joueur actif applique d'abord ses effets permanents, puis l'adversaire les siens.
2. Le joueur actif résout ensuite ses effets de remplacement, puis l'adversaire les siens.
3. Enfin, le joueur actif choisit l'ordre de ses propres effets automatiques, résout-les, puis l'adversaire fait de même pour les siens.

**Coûts d'activation et conditions** : un effet peut nécessiter un coût d'activation (action à effectuer avant les « : », ex : épuiser des DON!! symbolisés par un chiffre encerclé) et/ou des conditions (ex : `[DON!! xX]`, `[Votre tour]`). Si le coût ne peut être payé, même partiellement, l'effet ne peut pas être activé — un joueur qui devient incapable de finir de payer en cours de paiement doit s'acquitter du maximum possible, et la partie de l'effet après les « : » n'est pas appliquée.

## 8. Mots-clés d'effet

Ces mots-clés désignent des capacités spéciales inscrites dans le texte d'une carte :

- **[Initiative]** — la carte peut attaquer dès le tour où elle est jouée (contourne la règle par défaut d'absence d'attaque).
- **[Double attaque]** — l'attaque inflige 2 dégâts de Vie au lieu de 1 en cas de victoire contre un Leader.
- **[Exil]** — la carte de Vie touchée est défaussée directement au lieu de rejoindre la main du défenseur ; son [Déclenchement] éventuel ne s'active pas dans ce cas.
- **[Bloqueur]** — permet d'intercepter une attaque visant une autre de vos cartes en épuisant la carte porteuse de cet effet pendant l'étape de Blocage ; elle prend alors la place de la cible.
- **[Déclenchement]** — permet, quand la carte est révélée suite à un dégât sur la Vie, d'activer son effet au lieu de l'ajouter simplement à la main.

## 9. Mots-clés (glossaire de règles)

- **KO** — désigne une carte Personnage défaussée suite à une défaite en combat ou à un effet de carte. Les effets [En cas de KO] ou « ne peut pas être mise KO » ne s'appliquent que dans ce cas précis (pas si la carte est défaussée par un autre moyen).
- **[Activation : Principale]** — effet activable en phase Principale, hors combat.
- **[Principale]** — même chose, mais réservé aux cartes Événement.
- **[Contre]** — effet d'une carte Événement, activable uniquement pendant l'étape de Contre adverse.
- **[En attaquant]** — se déclenche à la déclaration d'une attaque.
- **[Jouée]** — se déclenche quand la carte est posée en jeu.
- **[Fin de votre tour]** / **[Fin du tour adverse]** — se déclenchent respectivement en phase de Fin de votre tour ou de celui de l'adversaire.
- **[DON!! xX]** — condition remplie quand le nombre de DON!! donnés à la carte atteint ou dépasse X.
- **DON!! -X** — coût consistant à renvoyer X cartes DON!! (prises n'importe où sur le terrain) vers le deck DON!!.
- **[Votre tour]** / **[Tour adverse]** — conditions liées à qui est le joueur actif.
- **[Une fois par tour]** — limite l'activation/résolution de l'effet à une seule fois par tour ; se réinitialise si la carte quitte puis revient sur le terrain (elle est alors considérée comme une nouvelle carte).
- **Défausser** — déplacer une carte de la main vers la Défausse.
- **[En bloquant]** — se déclenche à l'activation d'un [Bloqueur].
- **[Attaque adverse]** — se déclenche quand l'adversaire attaque, après les effets [En attaquant] de son côté.
- **[En cas de KO]** — cas particulier où la fenêtre d'activation se situe au moment de la mise KO, mais où l'effet se résout une fois la carte déjà dans la Défausse (elle change de zone entre le déclenchement et la résolution).

## 10. Traitement des règles et cas particuliers

**Traitement des règles** : certaines vérifications (notamment les conditions de défaite) sont effectuées automatiquement et immédiatement dès qu'un événement s'y prêtant se produit, même en plein milieu d'une autre action en cours.

**Boucles infinies** : si un enchaînement d'actions peut ou doit se répéter indéfiniment :
- Si aucun joueur ne peut l'arrêter → match nul.
- Si un seul joueur peut l'arrêter → il annonce à l'avance combien de répétitions il souhaite, puis met fin à la boucle.
- Si les deux le peuvent → le joueur actif annonce en premier son nombre souhaité, puis le non-actif ; la boucle s'arrête au plus petit des deux nombres annoncés.
Dans tous les cas, un joueur ne peut pas choisir de relancer indéfiniment la même boucle si l'état du jeu est identique, sauf s'il y est contraint par un effet.

**Révéler des cartes** : un déplacement entre deux zones secrètes (ex : deck → main via un effet) implique toujours de révéler la carte à l'adversaire au moment du déplacement, même sans instruction explicite en ce sens. Une fois l'effet résolu, la carte redevient « non révélée ».

**Regarder une zone secrète** : les cartes consultées via un effet restent dans leur zone d'origine et sont remises dans leur état initial (ordre, face) une fois la consultation terminée, sauf instruction contraire du texte de la carte.

## 11. Résumé rapide — points souvent oubliés en implémentation

Pour référence rapide lors du développement, les règles les plus fréquemment négligées ou mal implémentées :

1. Le joueur qui commence **ne pioche pas** et **ne pose qu'1 DON!!** à son premier tour, et **personne** ne peut attaquer lors de son propre premier tour.
2. Un Personnage tout juste joué **ne peut pas attaquer ce tour-ci**, sauf s'il a [Initiative].
3. On ne peut cibler qu'un Personnage adverse **épuisé**, jamais un redressé.
4. Limite stricte de **5 Personnages** et **1 Lieu** en jeu — dépasser implique une défausse forcée avant de jouer la nouvelle carte.
5. Une carte qui change de zone perd **tous** ses effets et DON!! attachés — elle est considérée comme neuve dans sa nouvelle zone.
6. Le nombre de cartes dans une zone est **toujours** une information publique, même pour les zones secrètes (main, deck, Vie) — seul le contenu est caché.
7. [Déclenchement] ne s'active **qu'au moment précis** où la carte est révélée suite à un dégât — jamais consultable à l'avance.
8. La défaite par deck vide et par Vie épuisée + dégât sont vérifiées en continu (traitement des règles), pas seulement à des moments dédiés du tour.