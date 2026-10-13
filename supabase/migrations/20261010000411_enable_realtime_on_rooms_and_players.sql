/*
# Enable Supabase Realtime on rooms and players tables

1. Purpose
   - The werewolf card dealer app relies on Supabase Realtime to sync
     player joins/leaves to the host and role assignments to players.
   - By default, new tables are NOT in the `supabase_realtime` publication,
     so postgres_changes subscriptions silently receive zero events.
   - This migration adds both `rooms` and `players` to the realtime publication.

2. Changes
   - `ALTER PUBLICATION supabase_realtime ADD TABLE rooms;`
   - `ALTER PUBLICATION supabase_realtime ADD TABLE players;`

3. Notes
   - This is idempotent: re-running will error harmlessly if already added.
   - No data changes, no RLS changes.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;