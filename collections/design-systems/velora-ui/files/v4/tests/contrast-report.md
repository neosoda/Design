# Velora UI V4 : audit de contraste WCAG

Généré par `node tests/contrast.mjs` à partir de `core/tokens.json`. 224 paires vérifiées, 0 sous le seuil.

Les surfaces givrées sont composées à l’opacité minimale autorisée par le Studio (50 %), au-dessus de chaque teinte de la toile : c’est le cas le plus défavorable, pas le cas moyen. Le seuil est 4,5:1 pour le texte et 3:1 pour les éléments non textuels.

## Light, contraste normal

| Paire | Texte | Fond | Ratio | Seuil | Résultat |
|---|---|---|---:|---:|---|
| Texte principal sur la surface la plus défavorable | `#181815` | `#f5e8d8` | 14,76 | 4.5 | Conforme |
| Texte secondaire sur la surface la plus défavorable | `#5f5f55` | `#f5e8d8` | 5,35 | 4.5 | Conforme |
| Texte principal sur la toile (neutre) | `#181815` | `#ece6dc` | 14,33 | 4.5 | Conforme |
| Texte principal sur la toile (teinte A) | `#181815` | `#f1dac0` | 13,16 | 4.5 | Conforme |
| Texte principal sur la toile (teinte B) | `#181815` | `#dfebdd` | 14,46 | 4.5 | Conforme |
| Placeholder (couleur secondaire) sur champ | `#5f5f55` | `#fbfaf7` | 6,18 | 4.5 | Conforme |
| Statut « ok » en texte | `#2b5c4e` | `#f5e8d8` | 6,35 | 4.5 | Conforme |
| Statut « warn » en texte | `#7a5a06` | `#f5e8d8` | 5,29 | 4.5 | Conforme |
| Statut « crit » en texte | `#a23818` | `#f5e8d8` | 5,59 | 4.5 | Conforme |
| Statut « info » en texte | `#3a5d8f` | `#f5e8d8` | 5,54 | 4.5 | Conforme |
| Texte encre sur tuile jaune | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Texte blanc sur tuile sapin | `#ffffff` | `#2b5c4e` | 7,65 | 4.5 | Conforme |
| Texte blanc sur tuile rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Texte blanc sur tuile charbon | `#ffffff` | `#181815` | 17,79 | 4.5 | Conforme |
| Texte sur tuile « gagné » | `#181815` | `#f6f3ed` | 16,06 | 4.5 | Conforme |
| Méta de tuile (blanc opaque, --t-sub: 1) sur rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Méta de tuile (blanc à 85 %) sur sapin | `#dfe7e4` | `#2b5c4e` | 6,08 | 4.5 | Conforme |
| Étape inactive du stepper (blanc à 80 %) sur sapin | `#d5dedc` | `#2b5c4e` | 5,58 | 4.5 | Conforme |
| Étape inactive du stepper (encre à 80 %) sur jaune | `#433b20` | `#f0c94e` | 6,99 | 4.5 | Conforme |
| Faits de la fiche (blanc sur rouille + voile sombre 10 %) | `#ffffff` | `#b2401d` | 5,76 | 4.5 | Conforme |
| Faits de la fiche (encre sur jaune + voile sombre 10 %) | `#181815` | `#d8b546` | 9,00 | 4.5 | Conforme |
| Méta de tuile (encre à 85 %) sur jaune | `#38331e` | `#f0c94e` | 7,93 | 4.5 | Conforme |
| Texte blanc sur charbon (rail, toast, bouton fort) | `#ffffff` | `#181815` | 17,79 | 4.5 | Conforme |
| Accent jaune sur charbon (navigation active) | `#f0c94e` | `#181815` | 11,16 | 4.5 | Conforme |
| Bouton accent (encre sur jaune) | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Statut critique sur pastille rouille 18 % | `#a23818` | `#eed5c9` | 4,81 | 4.5 | Conforme |
| Contour de focus sur la toile (non textuel) | `#2b5c4e` | `#ece6dc` | 6,17 | 3 | Conforme |
| Contour de focus sur surface pleine (non textuel) | `#2b5c4e` | `#f7f4ee` | 6,97 | 3 | Conforme |

## Light, contraste renforcé

| Paire | Texte | Fond | Ratio | Seuil | Résultat |
|---|---|---|---:|---:|---|
| Texte principal sur la surface la plus défavorable | `#181815` | `#f8f3ec` | 16,12 | 4.5 | Conforme |
| Texte secondaire sur la surface la plus défavorable | `#45453d` | `#f8f3ec` | 8,76 | 4.5 | Conforme |
| Texte principal sur la toile (neutre) | `#181815` | `#ece6dc` | 14,33 | 4.5 | Conforme |
| Texte principal sur la toile (teinte A) | `#181815` | `#f1dac0` | 13,16 | 4.5 | Conforme |
| Texte principal sur la toile (teinte B) | `#181815` | `#dfebdd` | 14,46 | 4.5 | Conforme |
| Placeholder (couleur secondaire) sur champ | `#45453d` | `#fbfaf7` | 9,26 | 4.5 | Conforme |
| Statut « ok » en texte | `#2b5c4e` | `#f8f3ec` | 6,93 | 4.5 | Conforme |
| Statut « warn » en texte | `#7a5a06` | `#f8f3ec` | 5,78 | 4.5 | Conforme |
| Statut « crit » en texte | `#a23818` | `#f8f3ec` | 6,11 | 4.5 | Conforme |
| Statut « info » en texte | `#3a5d8f` | `#f8f3ec` | 6,05 | 4.5 | Conforme |
| Texte encre sur tuile jaune | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Texte blanc sur tuile sapin | `#ffffff` | `#2b5c4e` | 7,65 | 4.5 | Conforme |
| Texte blanc sur tuile rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Texte blanc sur tuile charbon | `#ffffff` | `#181815` | 17,79 | 4.5 | Conforme |
| Texte sur tuile « gagné » | `#181815` | `#f6f3ed` | 16,06 | 4.5 | Conforme |
| Méta de tuile (blanc opaque, --t-sub: 1) sur rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Méta de tuile (blanc à 85 %) sur sapin | `#dfe7e4` | `#2b5c4e` | 6,08 | 4.5 | Conforme |
| Étape inactive du stepper (blanc à 80 %) sur sapin | `#d5dedc` | `#2b5c4e` | 5,58 | 4.5 | Conforme |
| Étape inactive du stepper (encre à 80 %) sur jaune | `#433b20` | `#f0c94e` | 6,99 | 4.5 | Conforme |
| Faits de la fiche (blanc sur rouille + voile sombre 10 %) | `#ffffff` | `#b2401d` | 5,76 | 4.5 | Conforme |
| Faits de la fiche (encre sur jaune + voile sombre 10 %) | `#181815` | `#d8b546` | 9,00 | 4.5 | Conforme |
| Méta de tuile (encre à 85 %) sur jaune | `#38331e` | `#f0c94e` | 7,93 | 4.5 | Conforme |
| Texte blanc sur charbon (rail, toast, bouton fort) | `#ffffff` | `#181815` | 17,79 | 4.5 | Conforme |
| Accent jaune sur charbon (navigation active) | `#f0c94e` | `#181815` | 11,16 | 4.5 | Conforme |
| Bouton accent (encre sur jaune) | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Statut critique sur pastille rouille 18 % | `#a23818` | `#eed5c9` | 4,81 | 4.5 | Conforme |
| Contour de focus sur la toile (non textuel) | `#2b5c4e` | `#ece6dc` | 6,17 | 3 | Conforme |
| Contour de focus sur surface pleine (non textuel) | `#2b5c4e` | `#f7f4ee` | 6,97 | 3 | Conforme |

## Dark, contraste normal

| Paire | Texte | Fond | Ratio | Seuil | Résultat |
|---|---|---|---:|---:|---|
| Texte principal sur la surface la plus défavorable | `#edece7` | `#262826` | 12,56 | 4.5 | Conforme |
| Texte secondaire sur la surface la plus défavorable | `#a7aaa2` | `#262826` | 6,30 | 4.5 | Conforme |
| Texte principal sur la toile (neutre) | `#edece7` | `#111312` | 15,77 | 4.5 | Conforme |
| Texte principal sur la toile (teinte A) | `#edece7` | `#2b2118` | 13,31 | 4.5 | Conforme |
| Texte principal sur la toile (teinte B) | `#edece7` | `#11211a` | 14,13 | 4.5 | Conforme |
| Placeholder (couleur secondaire) sur champ | `#a7aaa2` | `#262826` | 6,30 | 4.5 | Conforme |
| Statut « ok » en texte | `#7fc4ab` | `#262826` | 7,35 | 4.5 | Conforme |
| Statut « warn » en texte | `#e3c46d` | `#262826` | 8,76 | 4.5 | Conforme |
| Statut « crit » en texte | `#f29c7f` | `#262826` | 6,96 | 4.5 | Conforme |
| Statut « info » en texte | `#9fbbe3` | `#262826` | 7,56 | 4.5 | Conforme |
| Texte encre sur tuile jaune | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Texte blanc sur tuile sapin | `#ffffff` | `#2b5c4e` | 7,65 | 4.5 | Conforme |
| Texte blanc sur tuile rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Texte blanc sur tuile charbon | `#ffffff` | `#0b0c0c` | 19,59 | 4.5 | Conforme |
| Texte sur tuile « gagné » | `#edece7` | `#2a2c2a` | 11,90 | 4.5 | Conforme |
| Méta de tuile (blanc opaque, --t-sub: 1) sur rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Méta de tuile (blanc à 85 %) sur sapin | `#dfe7e4` | `#2b5c4e` | 6,08 | 4.5 | Conforme |
| Étape inactive du stepper (blanc à 80 %) sur sapin | `#d5dedc` | `#2b5c4e` | 5,58 | 4.5 | Conforme |
| Étape inactive du stepper (encre à 80 %) sur jaune | `#433b20` | `#f0c94e` | 6,99 | 4.5 | Conforme |
| Faits de la fiche (blanc sur rouille + voile sombre 10 %) | `#ffffff` | `#b2401d` | 5,76 | 4.5 | Conforme |
| Faits de la fiche (encre sur jaune + voile sombre 10 %) | `#181815` | `#d8b546` | 9,00 | 4.5 | Conforme |
| Méta de tuile (encre à 85 %) sur jaune | `#38331e` | `#f0c94e` | 7,93 | 4.5 | Conforme |
| Texte blanc sur charbon (rail, toast, bouton fort) | `#ffffff` | `#0b0c0c` | 19,59 | 4.5 | Conforme |
| Accent jaune sur charbon (navigation active) | `#f0c94e` | `#0b0c0c` | 12,28 | 4.5 | Conforme |
| Bouton accent (encre sur jaune) | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Statut critique sur pastille rouille 18 % | `#f29c7f` | `#3b251d` | 6,70 | 4.5 | Conforme |
| Contour de focus sur la toile (non textuel) | `#f0c94e` | `#111312` | 11,70 | 3 | Conforme |
| Contour de focus sur surface pleine (non textuel) | `#f0c94e` | `#1c1e1c` | 10,52 | 3 | Conforme |

## Dark, contraste renforcé

| Paire | Texte | Fond | Ratio | Seuil | Résultat |
|---|---|---|---:|---:|---|
| Texte principal sur la surface la plus défavorable | `#edece7` | `#262826` | 12,56 | 4.5 | Conforme |
| Texte secondaire sur la surface la plus défavorable | `#cfd1ca` | `#262826` | 9,64 | 4.5 | Conforme |
| Texte principal sur la toile (neutre) | `#edece7` | `#111312` | 15,77 | 4.5 | Conforme |
| Texte principal sur la toile (teinte A) | `#edece7` | `#2b2118` | 13,31 | 4.5 | Conforme |
| Texte principal sur la toile (teinte B) | `#edece7` | `#11211a` | 14,13 | 4.5 | Conforme |
| Placeholder (couleur secondaire) sur champ | `#cfd1ca` | `#262826` | 9,64 | 4.5 | Conforme |
| Statut « ok » en texte | `#7fc4ab` | `#262826` | 7,35 | 4.5 | Conforme |
| Statut « warn » en texte | `#e3c46d` | `#262826` | 8,76 | 4.5 | Conforme |
| Statut « crit » en texte | `#f29c7f` | `#262826` | 6,96 | 4.5 | Conforme |
| Statut « info » en texte | `#9fbbe3` | `#262826` | 7,56 | 4.5 | Conforme |
| Texte encre sur tuile jaune | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Texte blanc sur tuile sapin | `#ffffff` | `#2b5c4e` | 7,65 | 4.5 | Conforme |
| Texte blanc sur tuile rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Texte blanc sur tuile charbon | `#ffffff` | `#0b0c0c` | 19,59 | 4.5 | Conforme |
| Texte sur tuile « gagné » | `#edece7` | `#2a2c2a` | 11,90 | 4.5 | Conforme |
| Méta de tuile (blanc opaque, --t-sub: 1) sur rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Méta de tuile (blanc à 85 %) sur sapin | `#dfe7e4` | `#2b5c4e` | 6,08 | 4.5 | Conforme |
| Étape inactive du stepper (blanc à 80 %) sur sapin | `#d5dedc` | `#2b5c4e` | 5,58 | 4.5 | Conforme |
| Étape inactive du stepper (encre à 80 %) sur jaune | `#433b20` | `#f0c94e` | 6,99 | 4.5 | Conforme |
| Faits de la fiche (blanc sur rouille + voile sombre 10 %) | `#ffffff` | `#b2401d` | 5,76 | 4.5 | Conforme |
| Faits de la fiche (encre sur jaune + voile sombre 10 %) | `#181815` | `#d8b546` | 9,00 | 4.5 | Conforme |
| Méta de tuile (encre à 85 %) sur jaune | `#38331e` | `#f0c94e` | 7,93 | 4.5 | Conforme |
| Texte blanc sur charbon (rail, toast, bouton fort) | `#ffffff` | `#0b0c0c` | 19,59 | 4.5 | Conforme |
| Accent jaune sur charbon (navigation active) | `#f0c94e` | `#0b0c0c` | 12,28 | 4.5 | Conforme |
| Bouton accent (encre sur jaune) | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Statut critique sur pastille rouille 18 % | `#f29c7f` | `#3b251d` | 6,70 | 4.5 | Conforme |
| Contour de focus sur la toile (non textuel) | `#f0c94e` | `#111312` | 11,70 | 3 | Conforme |
| Contour de focus sur surface pleine (non textuel) | `#f0c94e` | `#1c1e1c` | 10,52 | 3 | Conforme |

## Ivory, contraste normal

| Paire | Texte | Fond | Ratio | Seuil | Résultat |
|---|---|---|---:|---:|---|
| Texte principal sur la surface la plus défavorable | `#25241f` | `#f0eee6` | 13,38 | 4.5 | Conforme |
| Texte secondaire sur la surface la plus défavorable | `#5c574d` | `#f0eee6` | 6,18 | 4.5 | Conforme |
| Texte principal sur la toile (neutre) | `#25241f` | `#eeebe3` | 13,05 | 4.5 | Conforme |
| Texte principal sur la toile (teinte A) | `#25241f` | `#f7ecdb` | 13,31 | 4.5 | Conforme |
| Texte principal sur la toile (teinte B) | `#25241f` | `#e5e3d8` | 12,07 | 4.5 | Conforme |
| Placeholder (couleur secondaire) sur champ | `#5c574d` | `#fffdf7` | 7,06 | 4.5 | Conforme |
| Statut « ok » en texte | `#2b5c4e` | `#f0eee6` | 6,59 | 4.5 | Conforme |
| Statut « warn » en texte | `#755607` | `#f0eee6` | 5,85 | 4.5 | Conforme |
| Statut « crit » en texte | `#a23818` | `#f0eee6` | 5,80 | 4.5 | Conforme |
| Statut « info » en texte | `#3a5d8f` | `#f0eee6` | 5,75 | 4.5 | Conforme |
| Texte encre sur tuile jaune | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Texte blanc sur tuile sapin | `#ffffff` | `#2b5c4e` | 7,65 | 4.5 | Conforme |
| Texte blanc sur tuile rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Texte blanc sur tuile charbon | `#ffffff` | `#26251f` | 15,36 | 4.5 | Conforme |
| Texte sur tuile « gagné » | `#25241f` | `#f7f3e8` | 14,02 | 4.5 | Conforme |
| Méta de tuile (blanc opaque, --t-sub: 1) sur rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Méta de tuile (blanc à 85 %) sur sapin | `#dfe7e4` | `#2b5c4e` | 6,08 | 4.5 | Conforme |
| Étape inactive du stepper (blanc à 80 %) sur sapin | `#d5dedc` | `#2b5c4e` | 5,58 | 4.5 | Conforme |
| Étape inactive du stepper (encre à 80 %) sur jaune | `#433b20` | `#f0c94e` | 6,99 | 4.5 | Conforme |
| Faits de la fiche (blanc sur rouille + voile sombre 10 %) | `#ffffff` | `#b2401d` | 5,76 | 4.5 | Conforme |
| Faits de la fiche (encre sur jaune + voile sombre 10 %) | `#181815` | `#d8b546` | 9,00 | 4.5 | Conforme |
| Méta de tuile (encre à 85 %) sur jaune | `#38331e` | `#f0c94e` | 7,93 | 4.5 | Conforme |
| Texte blanc sur charbon (rail, toast, bouton fort) | `#ffffff` | `#26251f` | 15,36 | 4.5 | Conforme |
| Accent jaune sur charbon (navigation active) | `#f0c94e` | `#26251f` | 9,64 | 4.5 | Conforme |
| Bouton accent (encre sur jaune) | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Statut critique sur pastille rouille 18 % | `#a23818` | `#f1d8cb` | 4,95 | 4.5 | Conforme |
| Contour de focus sur la toile (non textuel) | `#2b5c4e` | `#eeebe3` | 6,43 | 3 | Conforme |
| Contour de focus sur surface pleine (non textuel) | `#2b5c4e` | `#fbf8f1` | 7,22 | 3 | Conforme |

## Ivory, contraste renforcé

| Paire | Texte | Fond | Ratio | Seuil | Résultat |
|---|---|---|---:|---:|---|
| Texte principal sur la surface la plus défavorable | `#25241f` | `#faf8f1` | 14,63 | 4.5 | Conforme |
| Texte secondaire sur la surface la plus défavorable | `#403c34` | `#faf8f1` | 10,33 | 4.5 | Conforme |
| Texte principal sur la toile (neutre) | `#25241f` | `#eeebe3` | 13,05 | 4.5 | Conforme |
| Texte principal sur la toile (teinte A) | `#25241f` | `#f7ecdb` | 13,31 | 4.5 | Conforme |
| Texte principal sur la toile (teinte B) | `#25241f` | `#e5e3d8` | 12,07 | 4.5 | Conforme |
| Placeholder (couleur secondaire) sur champ | `#403c34` | `#fffdf7` | 10,79 | 4.5 | Conforme |
| Statut « ok » en texte | `#2b5c4e` | `#faf8f1` | 7,20 | 4.5 | Conforme |
| Statut « warn » en texte | `#755607` | `#faf8f1` | 6,39 | 4.5 | Conforme |
| Statut « crit » en texte | `#a23818` | `#faf8f1` | 6,34 | 4.5 | Conforme |
| Statut « info » en texte | `#3a5d8f` | `#faf8f1` | 6,29 | 4.5 | Conforme |
| Texte encre sur tuile jaune | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Texte blanc sur tuile sapin | `#ffffff` | `#2b5c4e` | 7,65 | 4.5 | Conforme |
| Texte blanc sur tuile rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Texte blanc sur tuile charbon | `#ffffff` | `#26251f` | 15,36 | 4.5 | Conforme |
| Texte sur tuile « gagné » | `#25241f` | `#f7f3e8` | 14,02 | 4.5 | Conforme |
| Méta de tuile (blanc opaque, --t-sub: 1) sur rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Méta de tuile (blanc à 85 %) sur sapin | `#dfe7e4` | `#2b5c4e` | 6,08 | 4.5 | Conforme |
| Étape inactive du stepper (blanc à 80 %) sur sapin | `#d5dedc` | `#2b5c4e` | 5,58 | 4.5 | Conforme |
| Étape inactive du stepper (encre à 80 %) sur jaune | `#433b20` | `#f0c94e` | 6,99 | 4.5 | Conforme |
| Faits de la fiche (blanc sur rouille + voile sombre 10 %) | `#ffffff` | `#b2401d` | 5,76 | 4.5 | Conforme |
| Faits de la fiche (encre sur jaune + voile sombre 10 %) | `#181815` | `#d8b546` | 9,00 | 4.5 | Conforme |
| Méta de tuile (encre à 85 %) sur jaune | `#38331e` | `#f0c94e` | 7,93 | 4.5 | Conforme |
| Texte blanc sur charbon (rail, toast, bouton fort) | `#ffffff` | `#26251f` | 15,36 | 4.5 | Conforme |
| Accent jaune sur charbon (navigation active) | `#f0c94e` | `#26251f` | 9,64 | 4.5 | Conforme |
| Bouton accent (encre sur jaune) | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Statut critique sur pastille rouille 18 % | `#a23818` | `#f1d8cb` | 4,95 | 4.5 | Conforme |
| Contour de focus sur la toile (non textuel) | `#2b5c4e` | `#eeebe3` | 6,43 | 3 | Conforme |
| Contour de focus sur surface pleine (non textuel) | `#2b5c4e` | `#fbf8f1` | 7,22 | 3 | Conforme |

## Mist, contraste normal

| Paire | Texte | Fond | Ratio | Seuil | Résultat |
|---|---|---|---:|---:|---|
| Texte principal sur la surface la plus défavorable | `#1f2a31` | `#ecf2f9` | 13,00 | 4.5 | Conforme |
| Texte secondaire sur la surface la plus défavorable | `#4e5d67` | `#ecf2f9` | 6,04 | 4.5 | Conforme |
| Texte principal sur la toile (neutre) | `#1f2a31` | `#e6ebef` | 12,20 | 4.5 | Conforme |
| Texte principal sur la toile (teinte A) | `#1f2a31` | `#dfe8f3` | 11,84 | 4.5 | Conforme |
| Texte principal sur la toile (teinte B) | `#1f2a31` | `#dbebe4` | 11,87 | 4.5 | Conforme |
| Placeholder (couleur secondaire) sur champ | `#4e5d67` | `#fdfefe` | 6,74 | 4.5 | Conforme |
| Statut « ok » en texte | `#2b5c4e` | `#ecf2f9` | 6,79 | 4.5 | Conforme |
| Statut « warn » en texte | `#735509` | `#ecf2f9` | 6,15 | 4.5 | Conforme |
| Statut « crit » en texte | `#a23818` | `#ecf2f9` | 5,98 | 4.5 | Conforme |
| Statut « info » en texte | `#365a8c` | `#ecf2f9` | 6,22 | 4.5 | Conforme |
| Texte encre sur tuile jaune | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Texte blanc sur tuile sapin | `#ffffff` | `#2b5c4e` | 7,65 | 4.5 | Conforme |
| Texte blanc sur tuile rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Texte blanc sur tuile charbon | `#ffffff` | `#22303a` | 13,53 | 4.5 | Conforme |
| Texte sur tuile « gagné » | `#1f2a31` | `#f1f5f7` | 13,35 | 4.5 | Conforme |
| Méta de tuile (blanc opaque, --t-sub: 1) sur rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Méta de tuile (blanc à 85 %) sur sapin | `#dfe7e4` | `#2b5c4e` | 6,08 | 4.5 | Conforme |
| Étape inactive du stepper (blanc à 80 %) sur sapin | `#d5dedc` | `#2b5c4e` | 5,58 | 4.5 | Conforme |
| Étape inactive du stepper (encre à 80 %) sur jaune | `#433b20` | `#f0c94e` | 6,99 | 4.5 | Conforme |
| Faits de la fiche (blanc sur rouille + voile sombre 10 %) | `#ffffff` | `#b2401d` | 5,76 | 4.5 | Conforme |
| Faits de la fiche (encre sur jaune + voile sombre 10 %) | `#181815` | `#d8b546` | 9,00 | 4.5 | Conforme |
| Méta de tuile (encre à 85 %) sur jaune | `#38331e` | `#f0c94e` | 7,93 | 4.5 | Conforme |
| Texte blanc sur charbon (rail, toast, bouton fort) | `#ffffff` | `#22303a` | 13,53 | 4.5 | Conforme |
| Accent jaune sur charbon (navigation active) | `#f0c94e` | `#22303a` | 8,49 | 4.5 | Conforme |
| Bouton accent (encre sur jaune) | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Statut critique sur pastille rouille 18 % | `#a23818` | `#edd9d4` | 4,97 | 4.5 | Conforme |
| Contour de focus sur la toile (non textuel) | `#2b5c4e` | `#e6ebef` | 6,38 | 3 | Conforme |
| Contour de focus sur surface pleine (non textuel) | `#2b5c4e` | `#f5f9fb` | 7,23 | 3 | Conforme |

## Mist, contraste renforcé

| Paire | Texte | Fond | Ratio | Seuil | Résultat |
|---|---|---|---:|---:|---|
| Texte principal sur la surface la plus défavorable | `#1f2a31` | `#f5f9fb` | 13,83 | 4.5 | Conforme |
| Texte secondaire sur la surface la plus défavorable | `#34424b` | `#f5f9fb` | 9,78 | 4.5 | Conforme |
| Texte principal sur la toile (neutre) | `#1f2a31` | `#e6ebef` | 12,20 | 4.5 | Conforme |
| Texte principal sur la toile (teinte A) | `#1f2a31` | `#dfe8f3` | 11,84 | 4.5 | Conforme |
| Texte principal sur la toile (teinte B) | `#1f2a31` | `#dbebe4` | 11,87 | 4.5 | Conforme |
| Placeholder (couleur secondaire) sur champ | `#34424b` | `#fdfefe` | 10,25 | 4.5 | Conforme |
| Statut « ok » en texte | `#2b5c4e` | `#f5f9fb` | 7,23 | 4.5 | Conforme |
| Statut « warn » en texte | `#735509` | `#f5f9fb` | 6,54 | 4.5 | Conforme |
| Statut « crit » en texte | `#a23818` | `#f5f9fb` | 6,36 | 4.5 | Conforme |
| Statut « info » en texte | `#365a8c` | `#f5f9fb` | 6,61 | 4.5 | Conforme |
| Texte encre sur tuile jaune | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Texte blanc sur tuile sapin | `#ffffff` | `#2b5c4e` | 7,65 | 4.5 | Conforme |
| Texte blanc sur tuile rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Texte blanc sur tuile charbon | `#ffffff` | `#22303a` | 13,53 | 4.5 | Conforme |
| Texte sur tuile « gagné » | `#1f2a31` | `#f1f5f7` | 13,35 | 4.5 | Conforme |
| Méta de tuile (blanc opaque, --t-sub: 1) sur rouille | `#ffffff` | `#c64720` | 4,86 | 4.5 | Conforme |
| Méta de tuile (blanc à 85 %) sur sapin | `#dfe7e4` | `#2b5c4e` | 6,08 | 4.5 | Conforme |
| Étape inactive du stepper (blanc à 80 %) sur sapin | `#d5dedc` | `#2b5c4e` | 5,58 | 4.5 | Conforme |
| Étape inactive du stepper (encre à 80 %) sur jaune | `#433b20` | `#f0c94e` | 6,99 | 4.5 | Conforme |
| Faits de la fiche (blanc sur rouille + voile sombre 10 %) | `#ffffff` | `#b2401d` | 5,76 | 4.5 | Conforme |
| Faits de la fiche (encre sur jaune + voile sombre 10 %) | `#181815` | `#d8b546` | 9,00 | 4.5 | Conforme |
| Méta de tuile (encre à 85 %) sur jaune | `#38331e` | `#f0c94e` | 7,93 | 4.5 | Conforme |
| Texte blanc sur charbon (rail, toast, bouton fort) | `#ffffff` | `#22303a` | 13,53 | 4.5 | Conforme |
| Accent jaune sur charbon (navigation active) | `#f0c94e` | `#22303a` | 8,49 | 4.5 | Conforme |
| Bouton accent (encre sur jaune) | `#181815` | `#f0c94e` | 11,16 | 4.5 | Conforme |
| Statut critique sur pastille rouille 18 % | `#a23818` | `#edd9d4` | 4,97 | 4.5 | Conforme |
| Contour de focus sur la toile (non textuel) | `#2b5c4e` | `#e6ebef` | 6,38 | 3 | Conforme |
| Contour de focus sur surface pleine (non textuel) | `#2b5c4e` | `#f5f9fb` | 7,23 | 3 | Conforme |

