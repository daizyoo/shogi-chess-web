import type { PieceType, Player, Position } from '../types'
import type { PromotionZoneConfig } from '../board/types'

// 成れる駒かチェック
export function canPromote(pieceType: PieceType): boolean {
  const promotablePieces: PieceType[] = ['pawn', 'lance', 'knight', 'silver', 'bishop', 'rook']
  return promotablePieces.includes(pieceType)
}

// 成りゾーンにいるかチェック
export function isInPromotionZone(
  position: Position,
  player: Player,
  promotionZone?: PromotionZoneConfig,
  boardSize: number = 9
): boolean {
  // promotion zone未設定または無効な場合はデフォルト（3行）を使用
  const zone = promotionZone || { rows: 3, fromTop: player === 1 }

  if (zone.rows === 0) {
    return false  // rows=0の場合は成れない
  }

  if (player === 1) {
    if (zone.fromTop) {
      return position.row < zone.rows
    } else {
      return position.row >= boardSize - zone.rows
    }
  } else {
    if (zone.fromTop) {
      return position.row < zone.rows
    } else {
      return position.row >= boardSize - zone.rows
    }
  }
}

// 移動によって成りが可能かチェック
export function canPromoteOnMove(
  from: Position,
  to: Position,
  player: Player,
  pieceType: PieceType,
  promotionZone?: PromotionZoneConfig,
  boardSize: number = 9
): boolean {
  // 既に成っている駒は成れない
  if (!canPromote(pieceType)) return false

  // 移動元か移動先のどちらかが成りゾーンにあれば成れる
  const fromInZone = isInPromotionZone(from, player, promotionZone, boardSize)
  const toInZone = isInPromotionZone(to, player, promotionZone, boardSize)

  return fromInZone || toInZone
}

// 必ず成らなければならない場合をチェック（行き場のない駒）
export function mustPromote(to: Position, player: Player, pieceType: PieceType, boardSize: number = 9): boolean {
  const direction = player === 1 ? -1 : 1
  const firstRow = player === 1 ? 0 : boardSize - 1
  const secondRow = player === 1 ? 1 : boardSize - 2

  // 歩と香車：最終段に行ったら必ず成る
  if (pieceType === 'pawn' || pieceType === 'lance') {
    return to.row === firstRow
  }

  // 桂馬：最初の2行に行ったら必ず成る
  if (pieceType === 'knight') {
    return to.row === firstRow || to.row === secondRow
  }

  return false
}

// 成り駒の名前を取得
export function getPromotedPieceType(pieceType: PieceType): PieceType {
  // 成り駒の対応表（実際は promoted フラグを使用）
  return pieceType
}

// === チェスプロモーション ===

// チェスのポーンがプロモーション可能かチェック
export function canPromoteChess(
  piece: { type: PieceType; player: Player },
  to: Position,
  promotionZone?: PromotionZoneConfig,
  boardSize: number = 8
): boolean {
  // チェスポーンのみプロモーション可能
  if (piece.type !== 'chess_pawn') return false

  // promotion zone未設定または無効な場合はデフォルト（1行）を使用
  const zone = promotionZone || { rows: 1, fromTop: piece.player === 1 }

  if (zone.rows === 0) {
    return false  // rows=0の場合はプロモーション無効
  }

  // promotion zoneの設定に基づいてチェック
  if (piece.player === 1) {
    if (zone.fromTop) {
      return to.row < zone.rows
    } else {
      return to.row >= boardSize - zone.rows
    }
  } else {
    if (zone.fromTop) {
      return to.row < zone.rows
    } else {
      return to.row >= boardSize - zone.rows
    }
  }
}

// チェスプロモーションの選択肢を取得
export function getChessPromotionOptions(): PieceType[] {
  return ['chess_queen', 'chess_rook', 'chess_bishop', 'chess_knight']
}
