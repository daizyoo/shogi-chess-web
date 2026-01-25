use crate::board::Board;
use crate::types::*;

/// Zobrist hashing for position keys
pub struct ZobristHasher {
    // Hash values for each piece type, position, and player
    // Format: [player][piece_type][position]
    piece_keys: [[[u64; 81]; 11]; 2],
    // Hash for player to move
    player_keys: [u64; 2],
}

impl ZobristHasher {
    pub fn new() -> Self {
        let mut hasher = ZobristHasher {
            piece_keys: [[[0; 81]; 11]; 2],
            player_keys: [0; 2],
        };
        hasher.init_random_keys();
        hasher
    }

    fn init_random_keys(&mut self) {
        // Simple LCG for deterministic random numbers
        let mut rng = 0x123456789abcdef0u64;

        for player in 0..2 {
            for piece_type in 0..11 {
                for pos in 0..81 {
                    rng = rng
                        .wrapping_mul(6364136223846793005)
                        .wrapping_add(1442695040888963407);
                    self.piece_keys[player][piece_type][pos] = rng;
                }
            }
        }

        for player in 0..2 {
            rng = rng
                .wrapping_mul(6364136223846793005)
                .wrapping_add(1442695040888963407);
            self.player_keys[player] = rng;
        }
    }

    pub fn hash(&self, board: &Board) -> u64 {
        let mut hash = 0u64;

        // Hash all pieces on the board
        for row in 0..board.size() {
            for col in 0..board.size() {
                if let Some(piece) = board.get(Position { row, col }) {
                    let player_idx = (piece.player - 1) as usize;
                    let piece_idx = piece_type_to_index(&piece.piece_type);
                    let pos_idx = row * 9 + col;
                    hash ^= self.piece_keys[player_idx][piece_idx][pos_idx];
                }
            }
        }

        // Hash current player
        hash ^= self.player_keys[(board.current_player - 1) as usize];

        hash
    }
}

fn piece_type_to_index(piece_type: &PieceType) -> usize {
    match piece_type {
        PieceType::King => 0,
        PieceType::Rook => 1,
        PieceType::Bishop => 2,
        PieceType::Gold => 3,
        PieceType::Silver => 4,
        PieceType::Knight => 5,
        PieceType::Lance => 6,
        PieceType::Pawn => 7,
        PieceType::ChessKing => 0,
        PieceType::ChessQueen => 8,
        PieceType::ChessRook => 9,
        PieceType::ChessBishop => 10,
        PieceType::ChessKnight => 5,
        PieceType::ChessPawn => 7,
    }
}

// Global static instance (lazy initialization)
static mut ZOBRIST: Option<ZobristHasher> = None;

pub fn get_zobrist() -> &'static ZobristHasher {
    unsafe {
        if ZOBRIST.is_none() {
            ZOBRIST = Some(ZobristHasher::new());
        }
        ZOBRIST.as_ref().unwrap()
    }
}
