/*
# Create rooms, players, and role_assignments tables for the Werewolf card dealer app

1. Purpose
   - This is a real-time multiplayer "Loup-Garou" (Werewolf) role card dealer.
   - A host creates a room, selects roles and quantities, and deals cards.
   - Players join via a 4-digit room code and receive a secret role card.
   - No authentication is needed — this is a single-tenant app with shared/public game data.
   - Real-time sync is handled via Supabase Realtime subscriptions.

2. New Tables
   - `rooms`: Represents a game room created by a host.
     - `id` (uuid, PK)
     - `code` (varchar(4), unique) — 4-digit room code for joining
     - `host_name` (text) — name of the host who created the room
     - `host_language` (text, default 'fr') — language the host chose
     - `status` (text, default 'waiting') — 'waiting' | 'dealing' | 'dealt'
     - `role_config` (jsonb) — array of {roleKey, quantity, customTitle, customDescription} objects
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

   - `players`: Represents a player who joined a room.
     - `id` (uuid, PK)
     - `room_id` (uuid, FK to rooms.id ON DELETE CASCADE)
     - `name` (text) — player's display name
     - `language` (text, default 'fr') — player's individual language preference ('ar' | 'fr')
     - `assigned_role` (text, nullable) — the role key assigned to this player after dealing
     - `assigned_custom_title` (text, nullable) — custom role title if the role is custom
     - `assigned_custom_description` (text, nullable) — custom role description if the role is custom
     - `has_seen_card` (boolean, default false) — whether the player has revealed their card
     - `joined_at` (timestamptz)
     - `updated_at` (timestamptz)

3. Indexes
   - `idx_players_room_id` on players(room_id) — fast lookup of players in a room
   - `idx_rooms_code` on rooms(code) — fast lookup by room code

4. Security
   - RLS is enabled on both tables.
   - Both tables use `TO anon, authenticated` because this is a no-auth, shared-data app.
   - All CRUD operations are allowed for anon + authenticated since game data is intentionally public within a room.
   - The room code itself provides the access boundary (you need the code to join and play).

5. Notes
   - `role_config` is stored as JSONB to flexibly support both built-in and custom roles.
   - The `status` field drives the real-time flow: 'waiting' (players joining) → 'dealing' (host deals) → 'dealt' (players have their cards).
   - Players subscribe to changes on their own player row to receive their assigned role in real-time.
   - The host subscribes to the rooms table and players table to see who joined and track dealing progress.
*/