use crate::types::*;
use wasm_bindgen::JsValue;

const BOARD_SIZE: usize = 9;

/// Board representation
#[derive(Debug, Clone, PartialEq)]
pub struct Board {
    pub cells: Vec<Vec<Option<Piece>>>,
    pub current_player: Player,
    pub hands: [Vec<PieceType>; 2], // Index 0 = Player 1, Index 1 = Player 2
    pub castling_rights: CastlingRights,
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
            castling_rights: CastlingRights::default(),
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
    pub fn make_move(&mut self, m: &mut Move) -> Result<(), JsValue> {
        // 0. キャスリング権利の現状を保存（Undo用）
        m.old_castling_rights = Some(self.castling_rights);

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

        // 1. キャスリングの場合、ルークも動かす
        if m.is_castling {
            let row = m.to.row;
            // キングが右（列番号が増える方）に動いたならキングサイド
            if m.to.col > m.from.col {
                // キングサイド: ルークは一番右(7)から、キングの左隣(5)へ
                let piece = self.cells[row][7].take();
                self.cells[row][5] = piece;
            } else {
                // クイーンサイド: ルークは一番左(0)から、キングの右隣(3)へ
                let piece = self.cells[row][0].take();
                self.cells[row][3] = piece;
            }
        }

        // 2. キャスリング権利の更新（キングが動いたら権利消失）
        if m.piece_type == PieceType::ChessKing || m.piece_type == PieceType::King {
             if self.current_player == 1 {
                 self.castling_rights.white_king_side = false;
                 self.castling_rights.white_queen_side = false;
             } else {
                 self.castling_rights.black_king_side = false;
                 self.castling_rights.black_queen_side = false;
             }
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

        // 1. キャスリングだった場合、ルークを元の位置に戻す
        if m.is_castling {
            let row = m.to.row;
            // キングが右（列番号が増える方）に動いた＝キングサイド
            if m.to.col > m.from.col {
                // 現在 5(F) にあるルークを 7(H) に戻す
                if let Some(rook) = self.cells[row][5].take() {
                    self.cells[row][7] = Some(rook);
                }
            } else {
                // 現在 3(D) にあるルークを 0(A) に戻す
                if let Some(rook) = self.cells[row][3].take() {
                    self.cells[row][0] = Some(rook);
                }
            }
        }

        // 2. キャスリング権利を元に戻す
        if let Some(old_rights) = m.old_castling_rights {
            self.castling_rights = old_rights;
        }

        // Switch player back
        self.current_player = 3 - self.current_player;

        Ok(())
    }

    /// キャスリングが可能か判定する
    pub fn can_castle(&self, player: Player, king_side: bool) -> bool {
        // 1. 権利の確認
        let rights = self.castling_rights;
        let has_right = if player == 1 { 
            if king_side { rights.white_king_side } else { rights.white_queen_side }
        } else {
            if king_side { rights.black_king_side } else { rights.black_queen_side }
        };

        if !has_right {
            return false;
        }

        // 2. 経路の空き確認
        // Player 1 は 0行目、Player 2 は 7行目
        let y = if player == 1 { 0 } else { 7 };
        
        if king_side {
            // キングサイド (右側: 5, 6 が空か)
            if self.cells[y][5].is_some() || self.cells[y][6].is_some() {
                return false;
            }
        } else {
            // クイーンサイド (左側: 1, 2, 3 が空か)
            if self.cells[y][1].is_some() || self.cells[y][2].is_some() || self.cells[y][3].is_some() {
                return false;
            }
        }
        
        true
    }
}