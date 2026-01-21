use serde::{Deserialize, Serialize};
use wasm_bindgen::JsValue;
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct CastlingRights {
    pub white_king_side: bool,
    pub white_queen_side: bool,
    pub black_king_side: bool,
    pub black_queen_side: bool,
}

impl Default for CastlingRights {
    fn default() -> Self {
        Self {
            white_king_side: true,
            white_queen_side: true,
            black_king_side: true,
            black_queen_side: true,
        }
    }
}
/// Piece type on the board
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PieceType {
    // Shogi pieces
    #[serde(rename = "king")]
    King,
    #[serde(rename = "rook")]
    Rook,
    #[serde(rename = "bishop")]
    Bishop,
    #[serde(rename = "gold")]
    Gold,
    #[serde(rename = "silver")]
    Silver,
    #[serde(rename = "knight")]
    Knight,
    #[serde(rename = "lance")]
    Lance,
    #[serde(rename = "pawn")]
    Pawn,

    // Chess pieces
    #[serde(rename = "chess_king")]
    ChessKing,
    #[serde(rename = "chess_queen")]
    ChessQueen,
    #[serde(rename = "chess_rook")]
    ChessRook,
    #[serde(rename = "chess_bishop")]
    ChessBishop,
    #[serde(rename = "chess_knight")]
    ChessKnight,
    #[serde(rename = "chess_pawn")]
    ChessPawn,
}

/// Player (1 or 2)
pub type Player = u8;

/// Piece on the board
#[derive(Debug, Clone, Serialize, Deserialize,PartialEq)]
pub struct Piece {
    #[serde(rename = "type")]
    pub piece_type: PieceType,
    pub player: Player,
    pub promoted: bool,
}

/// Position on the board
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Position {
    pub row: usize,
    pub col: usize,
}

/// Move representation
// キャスリングの権利の定義を使うために必要なら use crate::board::CastlingRights; をファイルの先頭に追加してください
// もし循環参照エラーになる場合は、CastlingRightsの定義を types.rs に移動する必要がありますが、
// 一旦、Option<Box<...>> 等で逃げるか、単純に bool 4つで保存する方法もあります。
// ここでは一番安全な「types.rs に CastlingRights を持ってくる」方法を提案します。

// ★重要: さっき board.rs に書いた CastlingRights の定義を、ここ(types.rs)に移動させるのが一番エラーが出ません。
// 手順が少し増えますが、その方が確実です。

 #[derive(Clone, Copy, Debug, PartialEq)]
 pub struct Move {
    pub from: Position,
    pub to: Position,
    pub piece_type: PieceType,
    pub promoted: bool,
    pub promotion: bool,
    pub captured: Option<PieceType>,
    // ↓↓ これを追加 ↓↓
    pub is_castling: bool, 
    // ↓↓ これを追加（Undo用。最初はNoneでOK）
    pub old_castling_rights: Option<CastlingRights>, 
}

/// Input format from JavaScript
#[derive(Debug, Deserialize)]
pub struct GameStateInput {
    pub board: Vec<Vec<Option<Piece>>>,
    #[serde(rename = "currentPlayer")]
    pub current_player: Player,
    pub hands: Option<HandPieces>,
}

/// Hand pieces (captured pieces)
#[derive(Debug, Deserialize)]
pub struct HandPieces {
    pub player1: Vec<PieceType>,
    pub player2: Vec<PieceType>,
}

/// Output format to JavaScript
#[derive(Debug, Serialize)]
pub struct MoveOutput {
    pub from: Position,
    pub to: Position,
    #[serde(rename = "pieceType")]
    pub piece_type: PieceType,
    pub promoted: bool,
    pub promotion: bool,
}

impl MoveOutput {
    pub fn from_move(m: &Move) -> Self {
        Self {
            from: m.from,
            to: m.to,
            piece_type: m.piece_type,
            promoted: m.promoted,
            promotion: m.promotion,
        }
    }
}

/// Convert Rust errors to JsValue
pub fn to_js_error(msg: &str) -> JsValue {
    JsValue::from_str(msg)
}
