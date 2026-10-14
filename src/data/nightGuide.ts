import { getRoleByKey } from '@/data/roles';
import type { Player } from '@/types';

/**
 * Order in which the Master wakes the roles during a night.
 * Roles that are not in the game are skipped automatically.
 */
export interface NightStep {
  roleKey: string;
  /** Only called on night 1. */
  firstNightOnly?: boolean;
  /** Only called on even nights: 2, 4, 6... (e.g. Loup Blanc). */
  evenNightsOnly?: boolean;
}

export const NIGHT_STEPS: NightStep[] = [
  { roleKey: 'protecteur' },
  { roleKey: 'voyante' },
  { roleKey: 'loup_garou' },
  { roleKey: 'loup_blanc', evenNightsOnly: true },
  { roleKey: 'sorciere' },
];

/** The steps to call tonight, given which roles are in the game. */
export function stepsForNight(presentRoleKeys: ReadonlySet<string>, round: number): NightStep[] {
  return NIGHT_STEPS.filter((step) => {
    if (!presentRoleKeys.has(step.roleKey)) return false;
    if (step.firstNightOnly && round !== 1) return false;
    if (step.evenNightsOnly && round % 2 !== 0) return false;
    return true;
  });
}

export function isWolfRole(roleKey: string | null): boolean {
  return !!roleKey && !!getRoleByKey(roleKey)?.isWolf;
}

export interface TeamCounts {
  wolves: number;
  village: number;
  total: number;
}

/** Counts the players still alive. Everything that is not a wolf counts as "village". */
export function countAlive(players: Player[]): TeamCounts {
  let wolves = 0;
  let village = 0;
  for (const p of players) {
    if (!p.assigned_role || !p.is_alive) continue;
    if (isWolfRole(p.assigned_role)) wolves++;
    else village++;
  }
  return { wolves, village, total: wolves + village };
}

export type WinHint = 'village' | 'wolves' | null;

/** Only a hint: lovers, Loup Blanc and custom roles can change who really wins. */
export function winHint({ wolves, village, total }: TeamCounts): WinHint {
  if (total === 0) return null;
  if (wolves === 0) return 'village';
  if (wolves >= village) return 'wolves';
  return null;
}
