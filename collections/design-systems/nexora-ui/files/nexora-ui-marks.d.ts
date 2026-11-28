/** Options de la piste SLA. */
export interface SlaOptions { /** Délai total en minutes ouvrées */ total: number; /** Minutes restantes ; négatif si dépassé */ left: number; state: 'ok' | 'risk' | 'over' | 'paused' | 'met'; /** Raison de suspension (demandeur, prestataire, pièce, accès au local) */ reason?: string; /** Piste pleine largeur (fiche) */ wide?: boolean; }
export type Priority = 1 | 2 | 3 | 4;
export type Status = 'new' | 'prog' | 'wait' | 'plan' | 'res' | 'closed';
export interface NexoraUINamespace {
  /** Pictogramme 16 px du jeu NexoraUI, en SVG (chaîne). */
  icon(name: string, cls?: string): string;
  /** Marque de priorité : barres + libellé. */
  prio(p: Priority): string;
  /** Marque d'état : glyphe + libellé ; la raison d'attente est donnée aux lecteurs d'écran. */
  status(s: Status, reason?: string): string;
  /** Piste SLA « Ligne de suivi ». */
  sla(o: SlaOptions): string;
  /** Durée au format NexoraUI : « 35 min », « 1 h 02 », « 2 j ouvrés ». */
  duration(minutes: number): string;
  avatar(initials?: string, cls?: string): string;
  /** Ligne au repos des états vides. */
  restGlyph(): string;
  logo: { symbol: string; lockup: string };
}
declare global { interface Window { NexoraUI: NexoraUINamespace; /** @deprecated Use NexoraUI */ ServiceDeskUI: NexoraUINamespace } }
