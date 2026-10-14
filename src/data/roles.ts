import {
  User,
  PawPrint,
  Shield,
  FlaskConical,
  Eye,
  Ghost,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface RoleDef {
  key: string;
  icon: LucideIcon;
  /** Card background: IDENTICAL for every role so players can't guess roles from card colour */
  gradient: string;
  /** Card glow: identical for every role (same reason) */
  glow: string;
  /** Accent color for borders/text */
  accent: string;
  /** Whether this is a "werewolf team" role */
  isWolf?: boolean;
  /** Whether this is a custom role (not in the built-in list) */
  isCustom?: boolean;
}

/** Neutral look shared by all player-facing cards. Only the icon colour (accent) differs. */
export const CARD_GRADIENT = 'from-mystery-800 via-mystery-900 to-mystery-950';
export const CARD_GLOW = 'glow-moon';

export const BUILTIN_ROLES: RoleDef[] = [
  {
    key: 'villageois',
    icon: User,
    gradient: CARD_GRADIENT,
    glow: CARD_GLOW,
    accent: 'text-moon-300',
  },
  {
    key: 'loup_garou',
    icon: PawPrint,
    gradient: CARD_GRADIENT,
    glow: CARD_GLOW,
    accent: 'text-blood-300',
    isWolf: true,
  },
  {
    key: 'protecteur',
    icon: Shield,
    gradient: CARD_GRADIENT,
    glow: CARD_GLOW,
    accent: 'text-forest-500',
  },
  {
    key: 'sorciere',
    icon: FlaskConical,
    gradient: CARD_GRADIENT,
    glow: CARD_GLOW,
    accent: 'text-blood-300',
  },
  {
    key: 'voyante',
    icon: Eye,
    gradient: CARD_GRADIENT,
    glow: CARD_GLOW,
    accent: 'text-moon-300',
  },
  {
    key: 'loup_blanc',
    icon: Ghost,
    gradient: CARD_GRADIENT,
    glow: CARD_GLOW,
    accent: 'text-ash-200',
    isWolf: true,
  },
  {
    key: 'chasseur',
    icon: Crosshair,
    gradient: CARD_GRADIENT,
    glow: CARD_GLOW,
    accent: 'text-gold-300',
  },
];

export function getRoleByKey(key: string): RoleDef | undefined {
  return BUILTIN_ROLES.find((r) => r.key === key);
}

export function makeCustomRole(): RoleDef {
  return {
    key: 'custom',
    icon: Sparkles,
    gradient: CARD_GRADIENT,
    glow: CARD_GLOW,
    accent: 'text-gold-300',
    isCustom: true,
  };
}


