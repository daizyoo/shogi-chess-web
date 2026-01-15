-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  board_type VARCHAR(20) NOT NULL,
  custom_board_id UUID,
  has_hand_pieces BOOLEAN NOT NULL DEFAULT false,
  player1_id VARCHAR(50),
  player2_id VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  current_turn INTEGER DEFAULT 1,
  game_state JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Custom boards table
CREATE TABLE IF NOT EXISTS custom_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  creator_id VARCHAR(50),
  board_config JSONB NOT NULL,
  has_hand_pieces BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Game history table (optional)
CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  moves JSONB NOT NULL,
  winner INTEGER,
  ended_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_custom_boards_public ON custom_boards(is_public);
CREATE INDEX IF NOT EXISTS idx_game_history_room ON game_history(room_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
