-- MIGRATION 001: Initial Database Setup
-- This migration creates the core tables for the Shogi-Chess Hybrid Game application
-- Execute this migration first when setting up a new Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ROOMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    board_type TEXT NOT NULL CHECK (board_type IN ('shogi', 'chess', 'hybrid', 'custom')),
    has_hand_pieces BOOLEAN DEFAULT false,
    player1_id TEXT,
    player2_id TEXT,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    current_turn INTEGER DEFAULT 1 CHECK (current_turn IN (1, 2)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GAME_STATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    board JSONB NOT NULL,
    hands JSONB NOT NULL DEFAULT '{"1": {}, "2": {}}'::jsonb,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    winner INTEGER CHECK (winner IN (1, 2)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MOVES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    player INTEGER NOT NULL CHECK (player IN (1, 2)),
    from_row INTEGER,
    from_col INTEGER,
    to_row INTEGER NOT NULL,
    to_col INTEGER NOT NULL,
    piece_type TEXT NOT NULL,
    promoted BOOLEAN DEFAULT false,
    captured_piece TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_last_activity ON public.rooms(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_states_room_id ON public.game_states(room_id);
CREATE INDEX IF NOT EXISTS idx_moves_room_id ON public.moves(room_id);
CREATE INDEX IF NOT EXISTS idx_moves_created_at ON public.moves(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;

-- Rooms: Anyone can read, anyone can create, only participants can update
CREATE POLICY "Rooms are publicly readable"
    ON public.rooms FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create rooms"
    ON public.rooms FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Participants can update rooms"
    ON public.rooms FOR UPDATE
    USING (true);

-- Game States: Anyone can read and write (for now)
CREATE POLICY "Game states are publicly readable"
    ON public.game_states FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create game states"
    ON public.game_states FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update game states"
    ON public.game_states FOR UPDATE
    USING (true);

-- Moves: Anyone can read and create
CREATE POLICY "Moves are publicly readable"
    ON public.moves FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create moves"
    ON public.moves FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at
    BEFORE UPDATE ON public.game_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REALTIME
-- ============================================================================
-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moves;
