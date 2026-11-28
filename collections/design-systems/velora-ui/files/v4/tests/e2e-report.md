# Velora UI V4 : recette navigateur

Généré par `node tests/e2e.mjs` (Chromium via Playwright, axe-core 4.14.1).

- axe-core, règles WCAG 2.0 / 2.1 / 2.2 niveaux A et AA : 92 vues analysées (23 vues × 4 palettes), **0 avec violation**.
- Débordement horizontal à 390, 768 et 1 440 px : 69 mesures, **0 débordement**.
- Parcours : 68 vérifications, **0 échec**.

Limites : axe-core ne détecte qu’une partie des problèmes d’accessibilité ; le contraste des surfaces translucides est vérifié séparément par `tests/contrast.mjs` (cas le plus défavorable). Aucun test avec lecteur d’écran réel n’a été mené.

## Parcours

| Parcours | Vérification | Résultat | Détail |
|---|---|---|---|
| ITSM, motion signature | card opens the stage dialog (morph) | OK |  |
| ITSM, motion signature | advancing the stage recolours the dialog without closing it | OK | vl-tile--yellow → vl-tile--green |
| ITSM, motion signature | Escape closes the dialog and focus returns to the card | OK |  |
| ITSM, motion signature | dragged card shows a lifted ghost | OK |  |
| ITSM, motion signature | drop moves the card to the target column | OK |  |
| ITSM, motion signature | toast "Annuler" reverts the move | OK |  |
| ITSM, motion signature | no JavaScript error during the journey | OK |  |
| ITSM, keyboard | first Tab reaches the skip link | OK |  |
| ITSM, keyboard | Space, arrow, Space moves a card to the next column | OK |  |
| ITSM, keyboard | "/" focuses the table search | OK |  |
| ITSM, keyboard | "priorite:p1" keeps only P1 tickets | OK |  |
| ITSM, keyboard | Enter on a ticket opens the docked inspector | OK |  |
| ITSM, keyboard | "j" shows the next ticket | OK |  |
| ITSM, keyboard | empty required field is flagged and focused | OK |  |
| ITSM, keyboard | valid edit is saved and shown in the table | OK |  |
| ITSM, keyboard | Ctrl+K opens the Command Center | OK |  |
| ITSM, keyboard | Shift+Enter adds the active command to favourites | OK |  |
| ITSM, keyboard | Enter runs the command (navigates to Flux) | OK |  |
| ITSM, keyboard | favourites are listed first when the query is empty | OK |  |
| ITSM, keyboard | "?" opens the keyboard shortcuts | OK |  |
| ITSM, keyboard | no JavaScript error during the journey | OK |  |
| ITSM, table and dashboard | inline edit of a cell shows an undo toast | OK |  |
| ITSM, table and dashboard | facet filter adds a removable chip | OK |  |
| ITSM, table and dashboard | saved view and filters persist after reload | OK | Réseau seulement |
| ITSM, table and dashboard | a column can be hidden | OK |  |
| ITSM, table and dashboard | row selection shows the bulk action bar | OK |  |
| ITSM, table and dashboard | arrow key on a widget handle moves the widget | OK |  |
| ITSM, table and dashboard | width button resizes the widget | OK |  |
| ITSM, table and dashboard | hidden widget can be added back and shows its error state | OK |  |
| ITSM, table and dashboard | Retry recovers the widget | OK |  |
| ITSM, table and dashboard | layout persists after reload | OK |  |
| ITSM, table and dashboard | no JavaScript error during the journey | OK |  |
| CRM | period switch redraws the revenue chart on 6 months | OK |  |
| CRM | hot deal opens its stage dialog | OK |  |
| CRM | empty deal title is rejected with a message | OK |  |
| CRM | new deal appears in the pipeline | OK |  |
| CRM | account opens in the inspector with its health meter | OK |  |
| CRM | no JavaScript error during the journey | OK |  |
| Administration | invalid e-mail is rejected | OK |  |
| Administration | invitation adds the user to the table | OK |  |
| Administration | changing a permission shows the pending-changes bar | OK |  |
| Administration | confirmed save clears the bar | OK |  |
| Administration | audit log records the permission change | OK |  |
| Administration | out-of-range setting is refused and focused | OK |  |
| Administration | no JavaScript error during the journey | OK |  |
| Supervision | probe widget shows its error state first | OK |  |
| Supervision | Retry loads the widget | OK |  |
| Supervision | live updates can be paused (WCAG 2.2.2) | OK |  |
| Supervision | an alert can be acknowledged from the feed | OK |  |
| Supervision | service tile opens with the keyboard | OK |  |
| Supervision | no JavaScript error during the journey | OK |  |
| Analytique | date range scopes the hero figure | OK |  |
| Analytique | segment filter updates the status line | OK |  |
| Analytique | every chart offers a data table view | OK |  |
| Analytique | a report can be created | OK |  |
| Analytique | no JavaScript error during the journey | OK |  |
| Studio and preferences | palette and density apply live | OK |  |
| Studio and preferences | CSS export reflects the settings | OK |  |
| Studio and preferences | invalid JSON import is refused with a message | OK |  |
| Studio and preferences | preferences carry over to another page | OK |  |
| Studio and preferences | rail behaviour "always open" applies | OK |  |
| Studio and preferences | activity center marks notifications read | OK |  |
| Studio and preferences | no JavaScript error during the journey | OK |  |
| Mobile 390 | bottom navigation is visible and the rail hidden | OK |  |
| Mobile 390 | bottom navigation changes view | OK |  |
| Mobile 390 | bottom navigation targets are at least 44 px | OK | 56 px |
| Mobile 390 | menu sheet lists sections and applications | OK |  |
| Mobile 390 | no JavaScript error during the journey | OK |  |

## axe-core par vue

| Palette | Page | Vue | Violations |
|---|---|---|---|
| light | index.html | start | aucune |
| light | index.html | integrate | aucune |
| light | studio/index.html | editor | aucune |
| light | playground/index.html | components | aucune |
| light | playground/index.html | foundations | aucune |
| light | playground/index.html | motion | aucune |
| light | playground/index.html | a11y | aucune |
| light | templates/itsm.html | dashboard | aucune |
| light | templates/itsm.html | tickets | aucune |
| light | templates/itsm.html | flow | aucune |
| light | templates/crm.html | overview | aucune |
| light | templates/crm.html | pipeline | aucune |
| light | templates/crm.html | accounts | aucune |
| light | templates/admin.html | users | aucune |
| light | templates/admin.html | roles | aucune |
| light | templates/admin.html | audit | aucune |
| light | templates/admin.html | settings | aucune |
| light | templates/monitoring.html | overview | aucune |
| light | templates/monitoring.html | services | aucune |
| light | templates/monitoring.html | alerts | aucune |
| light | templates/analytics.html | overview | aucune |
| light | templates/analytics.html | campaigns | aucune |
| light | templates/analytics.html | reports | aucune |
| dark | index.html | start | aucune |
| dark | index.html | integrate | aucune |
| dark | studio/index.html | editor | aucune |
| dark | playground/index.html | components | aucune |
| dark | playground/index.html | foundations | aucune |
| dark | playground/index.html | motion | aucune |
| dark | playground/index.html | a11y | aucune |
| dark | templates/itsm.html | dashboard | aucune |
| dark | templates/itsm.html | tickets | aucune |
| dark | templates/itsm.html | flow | aucune |
| dark | templates/crm.html | overview | aucune |
| dark | templates/crm.html | pipeline | aucune |
| dark | templates/crm.html | accounts | aucune |
| dark | templates/admin.html | users | aucune |
| dark | templates/admin.html | roles | aucune |
| dark | templates/admin.html | audit | aucune |
| dark | templates/admin.html | settings | aucune |
| dark | templates/monitoring.html | overview | aucune |
| dark | templates/monitoring.html | services | aucune |
| dark | templates/monitoring.html | alerts | aucune |
| dark | templates/analytics.html | overview | aucune |
| dark | templates/analytics.html | campaigns | aucune |
| dark | templates/analytics.html | reports | aucune |
| ivory | index.html | start | aucune |
| ivory | index.html | integrate | aucune |
| ivory | studio/index.html | editor | aucune |
| ivory | playground/index.html | components | aucune |
| ivory | playground/index.html | foundations | aucune |
| ivory | playground/index.html | motion | aucune |
| ivory | playground/index.html | a11y | aucune |
| ivory | templates/itsm.html | dashboard | aucune |
| ivory | templates/itsm.html | tickets | aucune |
| ivory | templates/itsm.html | flow | aucune |
| ivory | templates/crm.html | overview | aucune |
| ivory | templates/crm.html | pipeline | aucune |
| ivory | templates/crm.html | accounts | aucune |
| ivory | templates/admin.html | users | aucune |
| ivory | templates/admin.html | roles | aucune |
| ivory | templates/admin.html | audit | aucune |
| ivory | templates/admin.html | settings | aucune |
| ivory | templates/monitoring.html | overview | aucune |
| ivory | templates/monitoring.html | services | aucune |
| ivory | templates/monitoring.html | alerts | aucune |
| ivory | templates/analytics.html | overview | aucune |
| ivory | templates/analytics.html | campaigns | aucune |
| ivory | templates/analytics.html | reports | aucune |
| mist | index.html | start | aucune |
| mist | index.html | integrate | aucune |
| mist | studio/index.html | editor | aucune |
| mist | playground/index.html | components | aucune |
| mist | playground/index.html | foundations | aucune |
| mist | playground/index.html | motion | aucune |
| mist | playground/index.html | a11y | aucune |
| mist | templates/itsm.html | dashboard | aucune |
| mist | templates/itsm.html | tickets | aucune |
| mist | templates/itsm.html | flow | aucune |
| mist | templates/crm.html | overview | aucune |
| mist | templates/crm.html | pipeline | aucune |
| mist | templates/crm.html | accounts | aucune |
| mist | templates/admin.html | users | aucune |
| mist | templates/admin.html | roles | aucune |
| mist | templates/admin.html | audit | aucune |
| mist | templates/admin.html | settings | aucune |
| mist | templates/monitoring.html | overview | aucune |
| mist | templates/monitoring.html | services | aucune |
| mist | templates/monitoring.html | alerts | aucune |
| mist | templates/analytics.html | overview | aucune |
| mist | templates/analytics.html | campaigns | aucune |
| mist | templates/analytics.html | reports | aucune |
