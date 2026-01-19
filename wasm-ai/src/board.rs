use crate::types::*;
use wasm_bindgen::JsValue;

const BOARD_SIZE: usize = 9;

/// Board representation
#[derive(Debug, Clone)]
pub struct Board {
    pub cells: Vec<Vec<Option<Piece>>>,
    pub current_player: Player,
    pub hands: [Vec<PieceType>; 2], // Index 0 = Player 1, Index 1 = Player 2
}

impl Board {
    pub fn from_game_state(state: &GameStateInput) -> Result<Self, JsValue> {
        let size = state.board.len();
        if size == 0 || state.board[0].len() != size {
            return Err(to_js_error("Invalid board dimensions"));
        }

        let mut hands = [Vec::new(), Vec::new()];
        if let Some(ref hand_pieces) = state.hands {
            hands[0] = hand_pieces.player1.clone();
            hands[1] = hand_pieces.player2.clone();
        }

        Ok(Self {
            cells: state.board.clone(),
            current_player: state.current_player,
            hands,
        })
    }

    pub fn size(&self) -> usize {
        self.cells.len()
    }

    pub fn get(&self, pos: Position) -> Option<&Piece> {
        self.cells.get(pos.row)?.get(pos.col)?.as_ref()
    }

    pub fn get_mut(&mut self, pos: Position) -> Option<&mut Option<Piece>> {
        self.cells.get_mut(pos.row)?.get_mut(pos.col)
    }

    /// Make a move on the board
    pub fn make_move(&mut self, m: &Move) -> Result<(), JsValue> {
        // Capture piece if exists
        if let Some(piece) = self.get(m.to) {
            let captured_type = if piece.promoted {
                // Demote before capturing
                match piece.piece_type {
                    PieceType::Rook => PieceType::Rook,
                    PieceType::Bishop => PieceType::Bishop,
                    PieceType::Silver => PieceType::Silver,
                    PieceType::Knight => PieceType::Knight,
                    PieceType::Lance => PieceType::Lance,
                    PieceType::Pawn => PieceType::Pawn,
                    _ => piece.piece_type,
                }
            } else {
                piece.piece_type
            };

            self.hands[(self.current_player - 1) as usize].push(captured_type);
        }

        // Move piece
        if let Some(from_cell) = self.get_mut(m.from) {
            let mut piece = from_cell
                .take()
                .ok_or_else(|| to_js_error("No piece at from position"))?;

            // Apply promotion if needed
            if m.promotion {
                piece.promoted = true;
            }

            *self
                .get_mut(m.to)
                .ok_or_else(|| to_js_error("Invalid to position"))? = Some(piece);
        }

        // Switch player
        self.current_player = 3 - self.current_player;

        Ok(())
    }

    /// Undo a move
    pub fn unmake_move(&mut self, m: &Move, captured: Option<PieceType>) -> Result<(), JsValue> {
        // Move piece back
        if let Some(to_cell) = self.get_mut(m.to) {
            let mut piece = to_cell
                .take()
                .ok_or_else(|| to_js_error("No piece at to position"))?;

            // Undo promotion
            if m.promotion {
                piece.promoted = m.promoted;
            }

            *self
                .get_mut(m.from)
                .ok_or_else(|| to_js_error("Invalid from position"))? = Some(piece);
        }

        // Restore captured piece
        if let Some(captured_type) = captured {
            let opponent = 3 - self.current_player;
            *self
                .get_mut(m.to)
                .ok_or_else(|| to_js_error("Invalid to position"))? = Some(Piece {
                piece_type: captured_type,
                player: opponent,
                promoted: false,
            });

            // Remove from hand
            self.hands[(self.current_player - 1) as usize].retain(|&pt| pt != captured_type);
        }

        // Switch player back
        self.current_player = 3 - self.current_player;

        Ok(())
    }
}
