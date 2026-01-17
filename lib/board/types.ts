// Custom Board Types - Compatible with Rust format
export interface CustomBoardData {
  name: string
  board: string[] // Array of strings like "cr cn cb cq ck cb cn cr"
  player1: PlayerConfig
  player2: PlayerConfig
  promotionZones?: {  // Optional for backward compatibility
    player1: PromotionZoneConfig
    player2: PromotionZoneConfig
  }
}

export interface PlayerConfig {
  useHandPieces: boolean
}

export interface PromotionZoneConfig {
  rows: number        // Number of rows in promotion zone (e.g., 3)
  fromTop: boolean    // true: from top of board, false: from bottom
}

export type PieceSymbol =
  // Shogi pieces
  | 'K' | 'R' | 'B' | 'G' | 'S' | 'N' | 'L' | 'P'
  | 'k' | 'r' | 'b' | 'g' | 's' | 'n' | 'l' | 'p'
  // Chess pieces
  | 'CK' | 'CQ' | 'CR' | 'CB' | 'CN' | 'CP'
  | 'ck' | 'cq' | 'cr' | 'cb' | 'cn' | 'cp'
  // Empty
  | '.'

export const SHOGI_PIECES: PieceSymbol[] = ['K', 'R', 'B', 'G', 'S', 'N', 'L', 'P']
export const CHESS_PIECES: PieceSymbol[] = ['CK', 'CQ', 'CR', 'CB', 'CN', 'CP']

export const PIECE_NAMES: Record<string, string> = {
  'K': '玉', 'R': '飛', 'B': '角', 'G': '金', 'S': '銀', 'N': '桂', 'L': '香', 'P': '歩',
  'CK': '♔', 'CQ': '♕', 'CR': '♖', 'CB': '♗', 'CN': '♘', 'CP': '♙',
}

// Default board templates
export const DEFAULT_CHESS_BOARD: string[] = [
  "cr cn cb cq ck cb cn cr",
  "cp cp cp cp cp cp cp cp",
  ". . . . . . . .",
  ". . . . . . . .",
  ". . . . . . . .",
  ". . . . . . . .",
  "CP CP CP CP CP CP CP CP",
  "CR CN CB CQ CK CB CN CR",
]

export const DEFAULT_SHOGI_BOARD: string[] = [
  "l n s g k g s n l",
  ". r . . . . . b .",
  "p p p p p p p p p",
  ". . . . . . . . .",
  ". . . . . . . . .",
  ". . . . . . . . .",
  "P P P P P P P P P",
  ". B . . . . . R .",
  "L N S G K G S N L",
]

export const EMPTY_8x8_BOARD: string[] = Array(8).fill(". . . . . . . .")
export const EMPTY_9x9_BOARD: string[] = Array(9).fill(". . . . . . . . .")
