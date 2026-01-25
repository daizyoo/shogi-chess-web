use crate::board::Board;
use crate::config::AIConfig;
use crate::eval::evaluate;
use crate::moves::generate_moves;
use crate::tt::{Bound, TranspositionTable};
use crate::types::*;
use crate::zobrist;
use wasm_bindgen::JsValue;
use web_sys;

const INFINITY: i32 = 1_000_000;
const MATE_SCORE: i32 = 100_000;
const MAX_PLY: usize = 64;

/// Search state to track killer moves and other search data
struct SearchState {
    tt: TranspositionTable,
    killer_moves: Vec<[Option<Move>; 2]>,
    nodes_searched: usize,
}

impl SearchState {
    fn new(config: &AIConfig) -> Self {
        SearchState {
            tt: TranspositionTable::new(config.tt_size_mb),
            killer_moves: vec![[None, None]; MAX_PLY],
            nodes_searched: 0,
        }
    }
}

/// Find the best move using advanced search
pub fn find_best_move(board: &Board, player: Player, config: &AIConfig) -> Result<Move, JsValue> {
    let moves = generate_moves(board);

    if moves.is_empty() {
        return Err(to_js_error("No legal moves available"));
    }

    let mut state = SearchState::new(config);
    let mut best_move = moves[0].clone();
    let mut best_score = -INFINITY;

    web_sys::console::log_1(
        &format!(
            "Starting search: max_depth={}, legal_moves={}",
            config.max_depth,
            moves.len()
        )
        .into(),
    );

    // Iterative Deepening
    for depth in 1..=config.max_depth {
        let (score, mv) = search_root(board, player, depth, config, &mut state);

        if let Some(m) = mv {
            best_move = m;
            best_score = score;
        }

        web_sys::console::log_1(
            &format!(
                "Depth {} complete: score={}, nodes={}",
                depth, best_score, state.nodes_searched
            )
            .into(),
        );

        // Early exit if we found a mate
        if best_score.abs() > MATE_SCORE - 100 {
            web_sys::console::log_1(&"Early exit: mate found".into());
            break;
        }
    }

    web_sys::console::log_1(
        &format!("Search finished: total_nodes={}", state.nodes_searched).into(),
    );

    Ok(best_move)
}

/// Root search with iterative deepening
fn search_root(
    board: &Board,
    player: Player,
    depth: u8,
    config: &AIConfig,
    state: &mut SearchState,
) -> (i32, Option<Move>) {
    let mut moves = generate_moves(board);

    if moves.is_empty() {
        return (-MATE_SCORE, None);
    }

    // Order moves (TT move first if available)
    let hash = zobrist::get_zobrist().hash(board);
    if let Some(tt_entry) = state.tt.get(hash) {
        if let Some(ref tt_move) = tt_entry.best_move {
            // Move TT move to front
            if let Some(pos) = moves.iter().position(|m| m == tt_move) {
                moves.swap(0, pos);
            }
        }
    }

    order_moves(board, &mut moves, None, 0, config, state);

    let mut best_move = None;
    let mut best_score = -INFINITY;
    let mut alpha = -INFINITY;
    let beta = INFINITY;

    for m in moves {
        let mut new_board = board.clone();
        let captured = new_board.get(m.to).map(|p| p.piece_type);

        if new_board.make_move(&m).is_err() {
            continue;
        }

        let score = -alpha_beta(
            &new_board,
            depth - 1,
            -beta,
            -alpha,
            3 - player,
            1,
            config,
            state,
        );

        new_board.unmake_move(&m, captured).ok();

        if score > best_score {
            best_score = score;
            best_move = Some(m.clone());
        }

        alpha = alpha.max(best_score);

        if alpha >= beta {
            break;
        }
    }

    // Store in TT
    if config.use_tt {
        state
            .tt
            .store(hash, depth, best_score, Bound::Exact, best_move.clone());
    }

    (best_score, best_move)
}

/// Alpha-Beta search with enhancements
fn alpha_beta(
    board: &Board,
    depth: u8,
    mut alpha: i32,
    beta: i32,
    player: Player,
    ply: usize,
    config: &AIConfig,
    state: &mut SearchState,
) -> i32 {
    state.nodes_searched += 1;

    let alpha_orig = alpha;
    let hash = zobrist::get_zobrist().hash(board);

    // TT Lookup
    if config.use_tt {
        if let Some(entry) = state.tt.get(hash) {
            if entry.depth >= depth {
                match entry.bound {
                    Bound::Exact => return entry.score,
                    Bound::Lower => alpha = alpha.max(entry.score),
                    Bound::Upper => {
                        if entry.score < beta {
                            return entry.score;
                        }
                    }
                }
                if alpha >= beta {
                    return entry.score;
                }
            }
        }
    }

    // Leaf node - quiescence search
    if depth == 0 {
        return quiescence(board, alpha, beta, player, 0, config, state);
    }

    let mut moves = generate_moves(board);

    if moves.is_empty() {
        // Checkmate or stalemate
        return -MATE_SCORE + (ply as i32);
    }

    // Get TT move for ordering
    let tt_move = if config.use_tt {
        state.tt.get(hash).and_then(|e| e.best_move.clone())
    } else {
        None
    };

    // Move ordering
    order_moves(board, &mut moves, tt_move.as_ref(), ply, config, state);

    let mut best_score = -INFINITY;
    let mut best_move = None;

    for (_idx, m) in moves.iter().enumerate() {
        let mut new_board = board.clone();
        let captured = new_board.get(m.to).map(|p| p.piece_type);

        if new_board.make_move(m).is_err() {
            continue;
        }

        let score = -alpha_beta(
            &new_board,
            depth - 1,
            -beta,
            -alpha,
            3 - player,
            ply + 1,
            config,
            state,
        );

        new_board.unmake_move(m, captured).ok();

        if score > best_score {
            best_score = score;
            best_move = Some(m.clone());
        }

        alpha = alpha.max(best_score);

        if alpha >= beta {
            // Beta cutoff - store killer move
            if config.use_killers && ply < MAX_PLY {
                let is_capture = captured.is_some();
                if !is_capture {
                    // Update killer moves
                    if state.killer_moves[ply][0].as_ref() != Some(m) {
                        state.killer_moves[ply][1] = state.killer_moves[ply][0].clone();
                        state.killer_moves[ply][0] = Some(m.clone());
                    }
                }
            }
            break;
        }
    }

    // Store in TT
    if config.use_tt {
        let bound = if best_score <= alpha_orig {
            Bound::Upper
        } else if best_score >= beta {
            Bound::Lower
        } else {
            Bound::Exact
        };

        state.tt.store(hash, depth, best_score, bound, best_move);
    }

    best_score
}

/// Quiescence search to avoid horizon effect
fn quiescence(
    board: &Board,
    mut alpha: i32,
    beta: i32,
    player: Player,
    depth: u8,
    config: &AIConfig,
    state: &mut SearchState,
) -> i32 {
    state.nodes_searched += 1;

    // Stand-pat evaluation
    let stand_pat = evaluate(board, config);
    let stand_pat_player = if player == board.current_player {
        stand_pat
    } else {
        -stand_pat
    };

    if stand_pat_player >= beta {
        return beta;
    }

    if stand_pat_player > alpha {
        alpha = stand_pat_player;
    }

    // Depth limit
    if depth >= config.qsearch_depth {
        return alpha;
    }

    let moves = generate_moves(board);

    // Only consider captures
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

        let score = -quiescence(
            &new_board,
            -beta,
            -alpha,
            3 - player,
            depth + 1,
            config,
            state,
        );

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

/// Move ordering heuristic
fn order_moves(
    board: &Board,
    moves: &mut [Move],
    tt_move: Option<&Move>,
    ply: usize,
    config: &AIConfig,
    state: &SearchState,
) {
    let killers = if config.use_killers && ply < MAX_PLY {
        state.killer_moves[ply].clone()
    } else {
        [None, None]
    };

    moves.sort_by_key(|m| {
        let mut score = 0;

        // TT move first
        if Some(m) == tt_move {
            score -= 30000;
        }

        // Captures (MVV-LVA)
        if let Some(victim) = board.get(m.to) {
            let victim_value = piece_value(&victim.piece_type);
            score -= 10000 + victim_value;
        }

        // Killer moves
        if Some(m) == killers[0].as_ref() {
            score -= 5000;
        } else if Some(m) == killers[1].as_ref() {
            score -= 4000;
        }

        // Promotions
        if m.promoted {
            score -= 3000;
        }

        score
    });
}

/// Simple piece value for move ordering
fn piece_value(piece_type: &PieceType) -> i32 {
    match piece_type {
        PieceType::King | PieceType::ChessKing => 20000,
        PieceType::ChessQueen => 950,
        PieceType::Rook | PieceType::ChessRook => 500,
        PieceType::Bishop | PieceType::ChessBishop => 330,
        PieceType::Gold => 600,
        PieceType::Silver => 500,
        PieceType::Knight | PieceType::ChessKnight => 320,
        PieceType::Lance => 300,
        PieceType::Pawn | PieceType::ChessPawn => 100,
    }
}
