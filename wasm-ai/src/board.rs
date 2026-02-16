use crate::types::*;
use wasm_bindgen::JsValue;

const _BOARD_SIZE: usize = 9;

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

        // Move piece or Drop piece
        if let Some(from_pos) = m.from {
            // Normal move
            if let Some(from_cell) = self.get_mut(from_pos) {
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
        } else {
            // Drop move
            let piece_type = m.piece_type;
            let hand_index = (self.current_player - 1) as usize;

            // Check if player has the piece in hand
            if let Some(idx) = self.hands[hand_index].iter().position(|&p| p == piece_type) {
                self.hands[hand_index].remove(idx);

                // Place piece on board
                *self
                    .get_mut(m.to)
                    .ok_or_else(|| to_js_error("Invalid to position"))? = Some(Piece {
                    piece_type,
                    player: self.current_player,
                    promoted: false,
                });
            } else {
                return Err(to_js_error(&format!(
                    "Player {} does not have {:?} in hand",
                    self.current_player, piece_type
                )));
            }
        }

        // Switch player
        self.current_player = 3 - self.current_player;

        Ok(())
    }

    /// Undo a move
    pub fn unmake_move(&mut self, m: &Move, captured: Option<PieceType>) -> Result<(), JsValue> {
        // Move piece back or remove dropped piece
        if let Some(from_pos) = m.from {
            // Normal move undo
            if let Some(to_cell) = self.get_mut(m.to) {
                let mut piece = to_cell
                    .take()
                    .ok_or_else(|| to_js_error("No piece at to position"))?;

                // Undo promotion
                if m.promotion {
                    piece.promoted = m.promoted;
                }

                *self
                    .get_mut(from_pos)
                    .ok_or_else(|| to_js_error("Invalid from position"))? = Some(piece);
            }
        } else {
            // Drop move undo
            // Remove piece from board
            if self.get_mut(m.to).and_then(|c| c.take()).is_none() {
                return Err(to_js_error("No piece at to position for undo drop"));
            }

            // Return piece to hand
            self.hands[(self.current_player - 1) as usize].push(m.piece_type);
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
