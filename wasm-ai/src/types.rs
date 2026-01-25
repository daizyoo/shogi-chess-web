use serde::{Deserialize, Serialize};
use wasm_bindgen::JsValue;

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
#[derive(Debug, Clone, Serialize, Deserialize)]
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
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Move {
    pub from: Position,
    pub to: Position,
    pub piece_type: PieceType,
    pub promoted: bool,
    pub promotion: bool, // Whether this move promotes the piece
    pub captured: Option<PieceType>,
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
