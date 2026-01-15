import type { PieceType, Player, Position } from '../types'

// 成れる駒かチェック
export function canPromote(pieceType: PieceType): boolean {
  const promotablePieces: PieceType[] = ['pawn', 'lance', 'knight', 'silver', 'bishop', 'rook']
  return promotablePieces.includes(pieceType)
}

// 成りゾーンにいるかチェック
export function isInPromotionZone(position: Position, player: Player, boardSize: number = 9): boolean {
  if (player === 1) {
    // Player 1は上3行が成りゾーン
    return position.row <= 2
  } else {
    // Player 2は下3行が成りゾーン
    return position.row >= boardSize - 3
  }
}

// 移動によって成りが可能かチェック
export function canPromoteOnMove(
  from: Position,
  to: Position,
  player: Player,
  pieceType: PieceType,
  boardSize: number = 9
): boolean {
  // 既に成っている駒は成れない
  if (!canPromote(pieceType)) return false

  // 移動元か移動先のどちらかが成りゾーンにあれば成れる
  const fromInZone = isInPromotionZone(from, player, boardSize)
  const toInZone = isInPromotionZone(to, player, boardSize)

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
