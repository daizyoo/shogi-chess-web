-- Add player configuration columns to rooms table to support custom boards and hybrid setups
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS p1_config JSONB DEFAULT '{"isShogi": true, "useHandPieces": true}';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS p2_config JSONB DEFAULT '{"isShogi": true, "useHandPieces": true}';

-- Update existing rooms to have default values if they are null
UPDATE rooms SET p1_config = '{"isShogi": true, "useHandPieces": true}' WHERE p1_config IS NULL;
UPDATE rooms SET p2_config = '{"isShogi": true, "useHandPieces": true}' WHERE p2_config IS NULL;

-- If it's a chess board, set default configs accordingly
UPDATE rooms SET 
    p1_config = '{"isShogi": false, "useHandPieces": false}',
    p2_config = '{"isShogi": false, "useHandPieces": false}'
WHERE board_type = 'chess';
