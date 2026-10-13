/*
# Player names: unique per room, ignoring upper/lower case and outer spaces

1. Purpose
   - "Ali", "ali" and "Ali " must count as the same name inside one room,
     otherwise two players could look different in the database but identical
     at the table.

2. Changes
   - Drop the old unique index on (room_id, name).
   - Create a unique index on (room_id, lower(btrim(name))).

3. Notes
   - Safe on a fresh database (no existing rows to conflict).
   - No data is changed.
*/

DROP INDEX IF EXISTS players_room_id_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS players_room_id_lower_name_key
  ON players (room_id, lower(btrim(name)));
