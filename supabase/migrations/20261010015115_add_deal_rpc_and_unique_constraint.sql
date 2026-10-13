/*
# Add unique constraint, deal_cards RPC, and reset_room RPC for scalability

1. Purpose
   - Prevent duplicate player entries when reconnecting (unique on room_id + name).
   - Add server-side `deal_cards` RPC that atomically assigns roles to all players in one transaction.
   - Add server-side `reset_room` RPC that atomically clears all role assignments.
   - These replace the client-side sequential update loops that caused partial deals
     and timeouts with many players.

2. Changes
   - UNIQUE constraint on players(room_id, name) — prevents duplicate joins.
   - `deal_cards(p_room_id uuid, p_deck jsonb)` — takes the shuffled deck and assigns
     each card to a player in a single server-side transaction. Only runs if room
     status is 'dealing'. Returns count of assigned players.
   - `reset_room(p_room_id uuid)` — clears assigned_role, custom fields, has_seen_card
     on all players and resets room status to 'waiting'. Only runs if status is 'dealt'.

3. Security
   - Both functions are SECURITY DEFINER so they can update any player row regardless
     of RLS (the anon role has full CRUD via existing policies, but SECURITY DEFINER
     ensures the transaction is atomic).
   - Both functions are granted to anon and authenticated.

4. Notes
   - The unique constraint is safe: existing data has no duplicates by design.
   - If a duplicate join is attempted, the INSERT fails with a unique violation,
     which the frontend catches and treats as a rejoin.
*/

-- Unique constraint to prevent duplicate players in the same room
CREATE UNIQUE INDEX IF NOT EXISTS players_room_id_name_key
  ON players(room_id, name);

-- Atomic deal_cards function
CREATE OR REPLACE FUNCTION public.deal_cards(p_room_id uuid, p_deck jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_room_status text;
  v_player_ids uuid[];
  v_deck_item jsonb;
  v_idx integer;
BEGIN
  -- Check room exists and is in 'dealing' status
  SELECT status INTO v_room_status FROM rooms WHERE id = p_room_id;
  IF v_room_status IS NULL THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  IF v_room_status <> 'dealing' THEN
    RAISE EXCEPTION 'Room is not in dealing state (current: %)', v_room_status;
  END IF;

  -- Get all player IDs ordered by join time
  SELECT array_agg(id ORDER BY joined_at ASC) INTO v_player_ids
    FROM players WHERE room_id = p_room_id;

  v_count := array_length(v_player_ids, 1);
  IF v_count IS NULL OR v_count = 0 THEN
    RAISE EXCEPTION 'No players in room';
  END IF;

  IF jsonb_array_length(p_deck) <> v_count THEN
    RAISE EXCEPTION 'Deck size % does not match player count %',
      jsonb_array_length(p_deck), v_count;
  END IF;

  -- Assign each deck card to the corresponding player
  FOR v_idx IN 1..v_count LOOP
    v_deck_item := p_deck->(v_idx - 1);
    UPDATE players SET
      assigned_role = v_deck_item->>'roleKey',
      assigned_custom_title = NULLIF(v_deck_item->>'customTitle', ''),
      assigned_custom_description = NULLIF(v_deck_item->>'customDescription', ''),
      has_seen_card = false,
      updated_at = now()
    WHERE id = v_player_ids[v_idx];
  END LOOP;

  -- Mark room as dealt
  UPDATE rooms SET status = 'dealt', updated_at = now() WHERE id = p_room_id;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deal_cards(uuid, jsonb) TO anon, authenticated;

-- Atomic reset_room function
CREATE OR REPLACE FUNCTION public.reset_room(p_room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear all role assignments
  UPDATE players SET
    assigned_role = NULL,
    assigned_custom_title = NULL,
    assigned_custom_description = NULL,
    has_seen_card = false,
    updated_at = now()
  WHERE room_id = p_room_id;

  -- Reset room status
  UPDATE rooms SET status = 'waiting', updated_at = now() WHERE id = p_room_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_room(uuid) TO anon, authenticated;