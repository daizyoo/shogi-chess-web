use crate::board::Board;
use crate::config::AIConfig;
use crate::pst;
use crate::types::*;

/// Simple evaluation function
/// Returns score from current player's perspective
pub fn evaluate(board: &Board, config: &AIConfig) -> i32 {
    let mut score = 0;

    // Material evaluation
    for row in 0..board.size() {
        for col in 0..board.size() {
            if let Some(piece) = board.get(Position { row, col }) {
                let piece_value = get_piece_value(&piece.piece_type, piece.promoted);

                // Add PST bonus if enabled
                let pst_bonus = if config.use_pst {
                    pst::get_pst_value(&piece.piece_type, row, col, piece.player)
                } else {
                    0
                };

                if piece.player == board.current_player {
                    score += piece_value + pst_bonus;
                } else {
                    score -= piece_value + pst_bonus;
                }
            }
        }
    }

    // Hand pieces value
    for &piece_type in &board.hands[(board.current_player - 1) as usize] {
        score += get_piece_value(&piece_type, false) / 2;
    }

    let opponent = 3 - board.current_player;
    for &piece_type in &board.hands[(opponent - 1) as usize] {
        score -= get_piece_value(&piece_type, false) / 2;
    }

    score
}

fn get_piece_value(piece_type: &PieceType, promoted: bool) -> i32 {
    match piece_type {
        // Shogi pieces
        PieceType::King => 100000,
        PieceType::Rook => {
            if promoted {
                1000
            } else {
                900
            }
        }
        PieceType::Bishop => {
            if promoted {
                850
            } else {
                750
            }
        }
        PieceType::Gold => 600,
        PieceType::Silver => {
            if promoted {
                600
            } else {
                500
            }
        }
        PieceType::Knight => {
            if promoted {
                600
            } else {
                350
            }
        }
        PieceType::Lance => {
            if promoted {
                600
            } else {
                300
            }
        }
        PieceType::Pawn => {
            if promoted {
                600
            } else {
                100
            }
        }

        // Chess pieces
        PieceType::ChessKing => 100000,
        PieceType::ChessQueen => 950,
        PieceType::ChessRook => 500,
        PieceType::ChessBishop => 330,
        PieceType::ChessKnight => 320,
        PieceType::ChessPawn => 100,
    }
}

/// Check if a position is under attack
pub fn is_under_attack(board: &Board, pos: Position, by_player: Player) -> bool {
    // Simplified attack detection
    // For WASM version, we use a simpler heuristic

    for row in 0..board.size() {
        for col in 0..board.size() {
            if let Some(piece) = board.get(Position { row, col }) {
                if piece.player == by_player {
                    if can_attack(board, Position { row, col }, pos, piece) {
                        return true;
                    }
                }
            }
        }
    }

    false
}

fn can_attack(board: &Board, from: Position, to: Position, piece: &Piece) -> bool {
    // Simplified attack detection
    let dr = (to.row as i32 - from.row as i32).abs();
    let dc = (to.col as i32 - from.col as i32).abs();

    match piece.piece_type {
        PieceType::ChessQueen | PieceType::Rook if piece.promoted => {
            // Queen/Promoted Rook: any straight line or diagonal
            dr == 0 || dc == 0 || dr == dc
        }
        PieceType::Rook => {
            // Rook: straight lines only
            dr == 0 || dc == 0
        }
        PieceType::Bishop | PieceType::ChessBishop => {
            // Bishop: diagonals
            dr == dc
        }
        PieceType::Knight | PieceType::ChessKnight => {
            // Knight: L-shape
            (dr == 2 && dc == 1) || (dr == 1 && dc == 2)
        }
        _ => {
            // Simplified for other pieces
            dr <= 1 && dc <= 1
        }
    }
}
