use crate::types::PieceType;

// Simplified Position-Square Tables for WASM
// Values in centipawns, optimized for 9x9 board
// Index = row * 9 + col, where row 0 = top, row 8 = bottom
// Tables are from Player 1's perspective (bottom, moving up)

const PST_S_PAWN: [i32; 81] = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, // Rank 0 (promotion zone)
    15, 15, 15, 15, 15, 15, 15, 15, 15, // Rank 1
    10, 10, 10, 10, 10, 10, 10, 10, 10, // Rank 2
    5, 5, 5, 5, 5, 5, 5, 5, 5, // Rank 3
    2, 2, 2, 10, 10, 2, 2, 2, 2, // Rank 4
    1, 1, 2, 10, 10, 2, 1, 1, 1, // Rank 5
    0, 0, 0, 5, 5, 0, 0, 0, 0, // Rank 6
    0, 0, 0, -5, -5, 0, 0, 0, 0, // Rank 7
    0, 0, 0, 0, 0, 0, 0, 0, 0, // Rank 8 (home)
];

const PST_C_PAWN: [i32; 81] = [
    50, 50, 50, 50, 50, 50, 50, 50, 50, // Rank 0 (promotion!)
    20, 20, 20, 20, 20, 20, 20, 20, 20, // Rank 1
    10, 10, 10, 10, 10, 10, 10, 10, 10, // Rank 2
    5, 5, 5, 10, 10, 5, 5, 5, 5, // Rank 3
    2, 2, 5, 10, 10, 5, 2, 2, 2, // Rank 4
    1, 1, 2, 5, 5, 2, 1, 1, 1, // Rank 5
    0, 0, 0, 0, 0, 0, 0, 0, 0, // Rank 6
    0, 0, 0, 0, 0, 0, 0, 0, 0, // Rank 7
    0, 0, 0, 0, 0, 0, 0, 0, 0, // Rank 8
];

const PST_KNIGHT: [i32; 81] = [
    5, 5, 5, 5, 5, 5, 5, 5, 5, // Rank 0
    10, 10, 10, 10, 10, 10, 10, 10, 10, // Rank 1
    15, 15, 15, 15, 15, 15, 15, 15, 15, // Rank 2
    5, 5, 10, 10, 10, 10, 10, 5, 5, // Rank 3
    0, 0, 5, 5, 5, 5, 5, 0, 0, // Rank 4
    0, 0, 0, 0, 0, 0, 0, 0, 0, // Rank 5
    0, 0, 0, 0, 0, 0, 0, 0, 0, // Rank 6
    0, 5, 0, 0, 0, 0, 0, 5, 0, // Rank 7
    0, -10, 0, 0, 0, 0, 0, -10, 0, // Rank 8
];

const PST_KING: [i32; 81] = [
    -30, -40, -40, -40, -40, -40, -40, -40, -30, // Rank 0 (danger)
    -30, -40, -40, -40, -40, -40, -40, -40, -30, // Rank 1
    -30, -40, -40, -40, -40, -40, -40, -40, -30, // Rank 2
    -30, -40, -40, -40, -40, -40, -40, -40, -30, // Rank 3
    -10, -20, -20, -20, -20, -20, -20, -20, -10, // Rank 4
    0, -10, -10, -10, -10, -10, -10, -10, 0, // Rank 5
    10, 0, 0, 0, 0, 0, 0, 0, 10, // Rank 6
    20, 10, 0, 0, 0, 0, 0, 10, 20, // Rank 7
    30, 40, 30, 10, 0, 10, 30, 40, 30, // Rank 8 (safe)
];

const PST_GENERIC: [i32; 81] = [
    10, 10, 10, 10, 10, 10, 10, 10, 10, // Rank 0
    5, 5, 5, 5, 10, 5, 5, 5, 5, // Rank 1
    0, 0, 0, 5, 5, 5, 0, 0, 0, // Rank 2
    -5, 0, 5, 10, 10, 10, 5, 0, -5, // Rank 3 (center)
    -5, 0, 5, 10, 10, 10, 5, 0, -5, // Rank 4 (center)
    -5, 0, 0, 5, 5, 5, 0, 0, -5, // Rank 5
    -5, -5, 0, 0, 0, 0, 0, -5, -5, // Rank 6
    -5, -5, -5, -5, -5, -5, -5, -5, -5, // Rank 7
    -10, -10, -10, -10, -10, -10, -10, -10, -10, // Rank 8
];

/// Get PST value for a piece at a given position
/// player: 1 = Player1 (bottom), 2 = Player2 (top)
pub fn get_pst_value(piece_type: &PieceType, row: usize, col: usize, player: u8) -> i32 {
    // Select appropriate table
    let table = match piece_type {
        PieceType::Pawn => &PST_S_PAWN,
        PieceType::ChessPawn => &PST_C_PAWN,
        PieceType::Knight | PieceType::ChessKnight => &PST_KNIGHT,
        PieceType::King | PieceType::ChessKing => &PST_KING,
        _ => &PST_GENERIC,
    };

    // Calculate index (mirror for Player 2)
    let idx = if player == 1 {
        row * 9 + col
    } else {
        // Player 2: mirror both row and col
        (8 - row) * 9 + (8 - col)
    };

    // Bounds check
    if idx >= 81 {
        return 0;
    }

    table[idx]
}
