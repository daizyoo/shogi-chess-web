use crate::board::Board;
use crate::eval::evaluate;
use crate::moves::generate_moves;
use crate::types::*;
use wasm_bindgen::JsValue;

const INFINITY: i32 = 1_000_000;
const MATE_SCORE: i32 = 100_000;

/// Find the best move using Alpha-Beta pruning
pub fn find_best_move(board: &Board, player: Player, depth: u8) -> Result<Move, JsValue> {
    let moves = generate_moves(board);

    if moves.is_empty() {
        return Err(to_js_error("No legal moves available"));
    }

    let mut best_move = moves[0].clone();
    let mut best_score = -INFINITY;
    let mut alpha = -INFINITY;
    let beta = INFINITY;

    for m in moves {
        let mut new_board = board.clone();
        let captured = new_board.get(m.to).map(|p| p.piece_type);
        new_board.make_move(&m).ok();

        let score = -alpha_beta(&new_board, depth - 1, -beta, -alpha, 3 - player);

        new_board.unmake_move(&m, captured).ok();

        if score > best_score {
            best_score = score;
            best_move = m;
        }

        alpha = alpha.max(best_score);
        if alpha >= beta {
            break; // Beta cutoff
        }
    }

    Ok(best_move)
}

/// Alpha-Beta search
fn alpha_beta(board: &Board, depth: u8, mut alpha: i32, beta: i32, player: Player) -> i32 {
    if depth == 0 {
        return quiescence(board, alpha, beta, 2); // Quiescence search with limited depth
    }

    let moves = generate_moves(board);

    if moves.is_empty() {
        // Check if this is checkmate or stalemate
        // Simplified: just return a bad score
        return -MATE_SCORE + (6 - depth as i32) * 100;
    }

    let mut best_score = -INFINITY;

    for m in moves {
        let mut new_board = board.clone();
        let captured = new_board.get(m.to).map(|p| p.piece_type);

        if new_board.make_move(&m).is_err() {
            continue;
        }

        let score = -alpha_beta(&new_board, depth - 1, -beta, -alpha, 3 - player);

        new_board.unmake_move(&m, captured).ok();

        best_score = best_score.max(score);
        alpha = alpha.max(best_score);

        if alpha >= beta {
            break; // Beta cutoff
        }
    }

    best_score
}

/// Quiescence search to avoid horizon effect
fn quiescence(board: &Board, mut alpha: i32, beta: i32, depth: u8) -> i32 {
    let stand_pat = evaluate(board);

    if depth == 0 {
        return stand_pat;
    }

    if stand_pat >= beta {
        return beta;
    }

    if alpha < stand_pat {
        alpha = stand_pat;
    }

    let moves = generate_moves(board);

    // Only consider captures in quiescence search
    let capture_moves: Vec<_> = moves
        .into_iter()
        .filter(|m| board.get(m.to).is_some())
        .collect();

    for m in capture_moves {
        let mut new_board = board.clone();
        let captured = new_board.get(m.to).map(|p| p.piece_type);

        if new_board.make_move(&m).is_err() {
            continue;
        }

        let score = -quiescence(&new_board, -beta, -alpha, depth - 1);

        new_board.unmake_move(&m, captured).ok();

        if score >= beta {
            return beta;
        }

        if score > alpha {
            alpha = score;
        }
    }

    alpha
}
