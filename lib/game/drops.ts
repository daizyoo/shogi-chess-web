import type { BoardState, PieceType, Player, HandPieces } from '../types'

// 二歩チェック: 同じ列に既に歩があるかチェック
export function isNifu(board: BoardState, col: number, player: Player, pieceType: PieceType): boolean {
  // 歩以外は二歩にならない
  if (pieceType !== 'pawn') return false

  const boardSize = board.length
  for (let row = 0; row < boardSize; row++) {
    const piece = board[row][col]
    if (piece && piece.player === player && piece.type === 'pawn' && !piece.promoted) {
      return true // 同じ列に既に歩がある
    }
  }
  return false
}

// 持ち駒を配置可能な場所を取得
export function getDropPositions(
  board: BoardState,
  pieceType: PieceType,
  player: Player
): { row: number; col: number }[] {
  const positions: { row: number; col: number }[] = []
  const boardSize = board.length

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // 既に駒がある場所には置けない
      if (board[row][col]) continue

      // 二歩チェック
      if (isNifu(board, col, player, pieceType)) continue

      // 行き場のない駒のチェック（香車、桂馬、歩）
      const direction = player === 1 ? -1 : 1
      if (pieceType === 'pawn' || pieceType === 'lance') {
        // 歩と香車：1行目（相手の最終段）には置けない
        const firstRow = player === 1 ? 0 : boardSize - 1
        if (row === firstRow) continue
      } else if (pieceType === 'knight') {
        // 桂馬：最初の2行には置けない
        const firstRow = player === 1 ? 0 : boardSize - 1
        const secondRow = player === 1 ? 1 : boardSize - 2
        if (row === firstRow || row === secondRow) continue
      }

      positions.push({ row, col })
    }
  }

  return positions
}

// 持ち駒を使う
export function useHandPiece(
  hands: HandPieces,
  player: Player,
  pieceType: PieceType
): HandPieces {
  const newHands = { ...hands }
  const key = pieceType

  if (newHands[key] && newHands[key] > 0) {
    newHands[key]--
    if (newHands[key] === 0) {
      delete newHands[key]
    }
  }

  return newHands
}
