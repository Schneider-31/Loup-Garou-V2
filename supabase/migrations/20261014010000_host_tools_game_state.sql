/*
# Host tools: alive/dead players, night/day phase and night counter

1. Purpose
   - players.is_alive: the Master can mark a player as eliminated.
   - rooms.phase: 'lobby' (cards dealt, game not started), 'night' or 'day'.
   - rooms.round_number: current night/day number (starts at 1).
   - deal_cards / reset_room also reset these values, so "Deal again" starts clean.

2. Notes
   - Safe to run more than once (IF NOT EXISTS / CREATE OR REPLACE).
   - No existing data is deleted.
*/

ALTER TABLE players ADD COLUMN IF NOT EXISTS is_alive boolean NOT NULL DEFAULT true;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'lobby';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS round_number integer NOT NULL DEFAULT 1;
ALTER TABLE rooms ALTER COLUMN phase SET DEFAULT 'lobby';

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
  SELECT status INTO v_room_status FROM rooms WHERE id = p_room_id;
  IF v_room_status IS NULL THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  IF v_room_status <> 'dealing' THEN
    RAISE EXCEPTION 'Room is not in dealing state (current: %)', v_room_status;
  END IF;

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

  FOR v_idx IN 1..v_count LOOP
    v_deck_item := p_deck->(v_idx - 1);
    UPDATE players SET
      assigned_role = v_deck_item->>'roleKey',
      assigned_custom_title = NULLIF(v_deck_item->>'customTitle', ''),
      assigned_custom_description = NULLIF(v_deck_item->>'customDescription', ''),
      has_seen_card = false,
      is_alive = true,
      updated_at = now()
    WHERE id = v_player_ids[v_idx];
  END LOOP;

  -- Cards are out, but the game has not started yet: the host starts night 1 himself.
  UPDATE rooms SET
    status = 'dealt',
    phase = 'lobby',
    round_number = 1,
    updated_at = now()
  WHERE id = p_room_id;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deal_cards(uuid, jsonb) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.reset_room(p_room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE players SET
    assigned_role = NULL,
    assigned_custom_title = NULL,
    assigned_custom_description = NULL,
    has_seen_card = false,
    is_alive = true,
    updated_at = now()
  WHERE room_id = p_room_id;

  UPDATE rooms SET
    status = 'waiting',
    phase = 'lobby',
    round_number = 1,
    updated_at = now()
  WHERE id = p_room_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_room(uuid) TO anon, authenticated;
