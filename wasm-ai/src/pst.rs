use crate::types::PieceType;

// Simplified Position-Square Tables for WASM
// Values in centipawns, optimized for 9x9 board
// Index = row * 9 + col, where row 0 = top, row 8 = bottom
// Tables are from Player 1's perspective (bottom, moving up)

const PST_S_PAWN: [i32; 81] = [
    200, 200, 200, 200, 200, 200, 200, 200, 200, // Rank 0 (promotion zone) - very valuable
    150, 150, 150, 150, 150, 150, 150, 150, 150, // Rank 1
    100, 100, 100, 100, 100, 100, 100, 100, 100, // Rank 2
    60, 60, 60, 80, 80, 80, 60, 60, 60, // Rank 3
    30, 30, 50, 100, 100, 50, 30, 30, 30, // Rank 4 (center control)
    10, 10, 20, 80, 80, 20, 10, 10, 10, // Rank 5
    0, 0, 0, 30, 30, 0, 0, 0, 0, // Rank 6
    -10, -10, -10, -20, -20, -10, -10, -10, -10, // Rank 7
    -20, -20, -20, -30, -30, -20, -20, -20, -20, // Rank 8 (home - discourage staying)
];

const PST_C_PAWN: [i32; 81] = [
    500, 500, 500, 500, 500, 500, 500, 500, 500, // Rank 0 (promotion! huge bonus)
    300, 300, 300, 300, 300, 300, 300, 300, 300, // Rank 1
    150, 150, 150, 150, 150, 150, 150, 150, 150, // Rank 2
    80, 80, 100, 120, 120, 100, 80, 80, 80, // Rank 3
    40, 40, 60, 100, 100, 60, 40, 40, 40, // Rank 4
    20, 20, 30, 50, 50, 30, 20, 20, 20, // Rank 5
    0, 0, 0, 20, 20, 0, 0, 0, 0, // Rank 6
    -10, -10, -10, 0, 0, -10, -10, -10, -10, // Rank 7
    -20, -20, -20, -10, -10, -20, -20, -20, -20, // Rank 8
];

const PST_KNIGHT: [i32; 81] = [
    100, 100, 100, 100, 100, 100, 100, 100, 100, // Rank 0
    150, 150, 150, 150, 150, 150, 150, 150, 150, // Rank 1
    180, 180, 180, 180, 180, 180, 180, 180, 180, // Rank 2 (ideal position)
    100, 100, 150, 150, 150, 150, 150, 100, 100, // Rank 3
    50, 50, 80, 100, 100, 80, 50, 50, 50, // Rank 4
    20, 20, 40, 60, 60, 40, 20, 20, 20, // Rank 5
    0, 0, 20, 30, 30, 20, 0, 0, 0, // Rank 6
    -20, 0, -10, 0, 0, -10, 0, -20, -20, // Rank 7
    -50, -100, -30, -20, -20, -30, -100, -50, -50, // Rank 8 (corners very bad)
];

const PST_KING: [i32; 81] = [
    -300, -400, -400, -400, -400, -400, -400, -400, -300, // Rank 0 (extreme danger)
    -300, -400, -400, -400, -400, -400, -400, -400, -300, // Rank 1
    -300, -400, -400, -400, -400, -400, -400, -400, -300, // Rank 2
    -200, -300, -300, -300, -300, -300, -300, -300, -200, // Rank 3
    -100, -150, -150, -150, -150, -150, -150, -150, -100, // Rank 4
    -50, -80, -80, -80, -80, -80, -80, -80, -50, // Rank 5
    50, 20, 20, 20, 20, 20, 20, 20, 50, // Rank 6
    150, 100, 50, 30, 30, 50, 100, 150, 150, // Rank 7 (safe zone)
    200, 300, 200, 100, 50, 100, 200, 300, 200, // Rank 8 (castled position)
];

const PST_GENERIC: [i32; 81] = [
    120, 120, 120, 120, 120, 120, 120, 120, 120, // Rank 0
    80, 80, 80, 100, 120, 100, 80, 80, 80, // Rank 1
    50, 60, 70, 80, 100, 80, 70, 60, 50, // Rank 2
    30, 40, 60, 100, 120, 100, 60, 40, 30, // Rank 3 (center control)
    20, 30, 50, 100, 120, 100, 50, 30, 20, // Rank 4 (center control)
    10, 20, 30, 60, 80, 60, 30, 20, 10, // Rank 5
    -10, 0, 10, 30, 40, 30, 10, 0, -10, // Rank 6
    -30, -20, -10, 0, 10, 0, -10, -20, -30, // Rank 7
    -80, -60, -40, -30, -20, -30, -40, -60, -80, // Rank 8
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
