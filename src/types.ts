export interface RoleConfigEntry {
  roleKey: string;
  quantity: number;
  customTitle?: string;
  customDescription?: string;
}

export interface Room {
  id: string;
  code: string;
  host_name: string;
  host_language: string;
  status: 'waiting' | 'dealing' | 'dealt';
  role_config: RoleConfigEntry[];
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  language: string;
  assigned_role: string | null;
  assigned_custom_title: string | null;
  assigned_custom_description: string | null;
  has_seen_card: boolean;
  joined_at: string;
  updated_at: string;
}

export type AppScreen =
  | { name: 'home' }
  | { name: 'hostSetup' }
  | { name: 'hostDashboard'; roomId: string }
  | { name: 'playerJoin' }
  | { name: 'playerCard'; roomId: string; playerId: string };
