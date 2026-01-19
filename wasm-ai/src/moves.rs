use crate::board::Board;
use crate::types::*;

/// Generate all legal moves for the current player
pub fn generate_moves(board: &Board) -> Vec<Move> {
    let mut moves = Vec::new();

    // Generate moves for pieces on board
    for row in 0..board.size() {
        for col in 0..board.size() {
            if let Some(piece) = board.get(Position { row, col }) {
                if piece.player == board.current_player {
                    generate_piece_moves(board, Position { row, col }, piece, &mut moves);
                }
            }
        }
    }

    // TODO: Add drop moves for pieces in hand
    // For now, focusing on basic piece movement

    moves
}

fn generate_piece_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    match piece.piece_type {
        PieceType::King | PieceType::ChessKing => generate_king_moves(board, from, piece, moves),
        PieceType::Rook => generate_rook_moves(board, from, piece, moves),
        PieceType::Bishop => generate_bishop_moves(board, from, piece, moves),
        PieceType::ChessQueen => generate_queen_moves(board, from, piece, moves),
        PieceType::ChessRook => generate_chess_rook_moves(board, from, piece, moves),
        PieceType::ChessBishop => generate_chess_bishop_moves(board, from, piece, moves),
        PieceType::Knight | PieceType::ChessKnight => {
            generate_knight_moves(board, from, piece, moves)
        }
        PieceType::Lance => generate_lance_moves(board, from, piece, moves),
        PieceType::Pawn | PieceType::ChessPawn => generate_pawn_moves(board, from, piece, moves),
        PieceType::Gold => generate_gold_moves(board, from, piece, moves),
        PieceType::Silver => generate_silver_moves(board, from, piece, moves),
    }
}

fn generate_king_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let directions = [
        (-1, -1),
        (-1, 0),
        (-1, 1),
        (0, -1),
        (0, 1),
        (1, -1),
        (1, 0),
        (1, 1),
    ];

    for &(dr, dc) in &directions {
        if let Some(to) = add_delta(from, dr, dc, board.size()) {
            if can_move_to(board, to, piece.player) {
                add_move(moves, from, to, piece, false);
            }
        }
    }
}

fn generate_rook_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let directions = [(0, 1), (0, -1), (1, 0), (-1, 0)];

    if piece.promoted {
        // Promoted rook can also move diagonally by 1
        generate_sliding_moves(board, from, piece, &directions, moves);
        let diag_dirs = [(-1, -1), (-1, 1), (1, -1), (1, 1)];
        for &(dr, dc) in &diag_dirs {
            if let Some(to) = add_delta(from, dr, dc, board.size()) {
                if can_move_to(board, to, piece.player) {
                    add_move(moves, from, to, piece, false);
                }
            }
        }
    } else {
        generate_sliding_moves(board, from, piece, &directions, moves);
    }
}

fn generate_bishop_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)];

    if piece.promoted {
        // Promoted bishop can also move orthogonally by 1
        generate_sliding_moves(board, from, piece, &directions, moves);
        let orth_dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)];
        for &(dr, dc) in &orth_dirs {
            if let Some(to) = add_delta(from, dr, dc, board.size()) {
                if can_move_to(board, to, piece.player) {
                    add_move(moves, from, to, piece, false);
                }
            }
        }
    } else {
        generate_sliding_moves(board, from, piece, &directions, moves);
    }
}

fn generate_queen_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let directions = [
        (0, 1),
        (0, -1),
        (1, 0),
        (-1, 0),
        (-1, -1),
        (-1, 1),
        (1, -1),
        (1, 1),
    ];
    generate_sliding_moves(board, from, piece, &directions, moves);
}

fn generate_chess_rook_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let directions = [(0, 1), (0, -1), (1, 0), (-1, 0)];
    generate_sliding_moves(board, from, piece, &directions, moves);
}

fn generate_chess_bishop_moves(
    board: &Board,
    from: Position,
    piece: &Piece,
    moves: &mut Vec<Move>,
) {
    let directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)];
    generate_sliding_moves(board, from, piece, &directions, moves);
}

fn generate_knight_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let deltas = if piece.piece_type == PieceType::ChessKnight {
        // Chess knight moves in all directions
        vec![
            (-2, -1),
            (-2, 1),
            (-1, -2),
            (-1, 2),
            (1, -2),
            (1, 2),
            (2, -1),
            (2, 1),
        ]
    } else {
        // Shogi knight (moves forward only)
        let forward = if piece.player == 1 { -1 } else { 1 };
        vec![(forward * 2, -1), (forward * 2, 1)]
    };

    for &(dr, dc) in &deltas {
        if let Some(to) = add_delta(from, dr, dc, board.size()) {
            if can_move_to(board, to, piece.player) {
                add_move(moves, from, to, piece, false);
            }
        }
    }
}

fn generate_lance_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let forward = if piece.player == 1 { -1 } else { 1 };
    generate_sliding_moves(board, from, piece, &[(forward, 0)], moves);
}

fn generate_pawn_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let forward = if piece.player == 1 { -1 } else { 1 };

    if let Some(to) = add_delta(from, forward, 0, board.size()) {
        if board.get(to).is_none() {
            add_move(moves, from, to, piece, false);
        }
    }
}

fn generate_gold_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    let forward = if piece.player == 1 { -1 } else { 1 };
    let directions = [
        (forward, -1),
        (forward, 0),
        (forward, 1),
        (0, -1),
        (0, 1),
        (-forward, 0),
    ];

    for &(dr, dc) in &directions {
        if let Some(to) = add_delta(from, dr, dc, board.size()) {
            if can_move_to(board, to, piece.player) {
                add_move(moves, from, to, piece, false);
            }
        }
    }
}

fn generate_silver_moves(board: &Board, from: Position, piece: &Piece, moves: &mut Vec<Move>) {
    if piece.promoted {
        generate_gold_moves(board, from, piece, moves);
        return;
    }

    let forward = if piece.player == 1 { -1 } else { 1 };
    let directions = [
        (forward, -1),
        (forward, 0),
        (forward, 1),
        (-forward, -1),
        (-forward, 1),
    ];

    for &(dr, dc) in &directions {
        if let Some(to) = add_delta(from, dr, dc, board.size()) {
            if can_move_to(board, to, piece.player) {
                add_move(moves, from, to, piece, false);
            }
        }
    }
}

fn generate_sliding_moves(
    board: &Board,
    from: Position,
    piece: &Piece,
    directions: &[(i32, i32)],
    moves: &mut Vec<Move>,
) {
    for &(dr, dc) in directions {
        let mut current = from;
        loop {
            let Some(next) = add_delta(current, dr, dc, board.size()) else {
                break;
            };

            if let Some(target_piece) = board.get(next) {
                if target_piece.player != piece.player {
                    add_move(moves, from, next, piece, false);
                }
                break;
            }

            add_move(moves, from, next, piece, false);
            current = next;
        }
    }
}

fn add_delta(pos: Position, dr: i32, dc: i32, board_size: usize) -> Option<Position> {
    let new_row = pos.row as i32 + dr;
    let new_col = pos.col as i32 + dc;

    if new_row >= 0 && new_row < board_size as i32 && new_col >= 0 && new_col < board_size as i32 {
        Some(Position {
            row: new_row as usize,
            col: new_col as usize,
        })
    } else {
        None
    }
}

fn can_move_to(board: &Board, pos: Position, player: Player) -> bool {
    board.get(pos).map_or(true, |p| p.player != player)
}

fn add_move(moves: &mut Vec<Move>, from: Position, to: Position, piece: &Piece, promotion: bool) {
    moves.push(Move {
        from,
        to,
        piece_type: piece.piece_type,
        promoted: piece.promoted,
        promotion,
        captured: None,
    });
}
