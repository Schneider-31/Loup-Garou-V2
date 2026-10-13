import {
  User,
  PawPrint,
  Shield,
  FlaskConical,
  Eye,
  Ghost,
  Heart,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface RoleDef {
  key: string;
  icon: LucideIcon;
  /** Tailwind gradient classes for the card background */
  gradient: string;
  /** Glow class for the card */
  glow: string;
  /** Accent color for borders/text */
  accent: string;
  /** Whether this is a "werewolf team" role */
  isWolf?: boolean;
  /** Whether this is a custom role (not in the built-in list) */
  isCustom?: boolean;
}

export const BUILTIN_ROLES: RoleDef[] = [
  {
    key: 'villageois',
    icon: User,
    gradient: 'from-moon-900 via-moon-800 to-mystery-900',
    glow: 'glow-moon',
    accent: 'text-moon-300',
  },
  {
    key: 'loup_garou',
    icon: PawPrint,
    gradient: 'from-blood-900 via-blood-800 to-mystery-950',
    glow: 'glow-blood',
    accent: 'text-blood-300',
    isWolf: true,
  },
  {
    key: 'protecteur',
    icon: Shield,
    gradient: 'from-forest-700 via-forest-600 to-mystery-900',
    glow: 'glow-moon',
    accent: 'text-forest-500',
  },
  {
    key: 'sorciere',
    icon: FlaskConical,
    gradient: 'from-mystery-700 via-blood-900 to-mystery-950',
    glow: 'glow-blood',
    accent: 'text-blood-300',
  },
  {
    key: 'voyante',
    icon: Eye,
    gradient: 'from-mystery-800 via-moon-900 to-mystery-950',
    glow: 'glow-moon',
    accent: 'text-moon-300',
  },
  {
    key: 'loup_blanc',
    icon: Ghost,
    gradient: 'from-ash-600 via-mystery-800 to-mystery-950',
    glow: 'glow-gold',
    accent: 'text-ash-200',
    isWolf: true,
  },
  {
    key: 'cupidon',
    icon: Heart,
    gradient: 'from-blood-800 via-blood-700 to-mystery-900',
    glow: 'glow-blood',
    accent: 'text-blood-300',
  },
];

export function getRoleByKey(key: string): RoleDef | undefined {
  return BUILTIN_ROLES.find((r) => r.key === key);
}

export function makeCustomRole(): RoleDef {
  return {
    key: 'custom',
    icon: Sparkles,
    gradient: 'from-gold-800 via-gold-700 to-mystery-900',
    glow: 'glow-gold',
    accent: 'text-gold-300',
    isCustom: true,
  };
}


