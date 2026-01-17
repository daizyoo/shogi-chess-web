import type { BoardState, Player, Position } from '../types'
import { getPossibleMoves } from './board'

// 王手判定: 指定したプレイヤーの王が攻撃されているか
export function isInCheck(board: BoardState, player: Player): boolean {
  // 王の位置を探す
  const kingPos = findKing(board, player)
  if (!kingPos) return false // 王がいない場合は王手ではない（既に取られている）

  // 敵の全ての駒について、その駒が王の位置に移動できるかチェック
  const opponent: Player = player === 1 ? 2 : 1
  const boardSize = board.length

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col]
      if (piece && piece.player === opponent) {
        const moves = getPossibleMoves(board, { row, col }, piece)
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true
        }
      }
    }
  }

  return false
}

// 詰み判定: 王手がかかっていて、逃げる手がない
export function isCheckmate(board: BoardState, player: Player): boolean {
  // 王がいない場合は詰み（既に取られている）
  const kingPos = findKing(board, player)
  if (!kingPos) return true

  // 王手がかかっていなければ詰みではない
  if (!isInCheck(board, player)) return false

  // 自分の全ての駒について、合法手があるかチェック
  const boardSize = board.length

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        const from: Position = { row, col }
        const possibleMoves = getPossibleMoves(board, from, piece)

        // それぞれの移動について、王手が回避できるかチェック
        for (const to of possibleMoves) {
          // 仮に移動してみる
          const testBoard = board.map(r => [...r])
          testBoard[to.row][to.col] = piece
          testBoard[from.row][from.col] = null

          // この移動で王手が解除されるか
          if (!isInCheck(testBoard, player)) {
            return false // 逃げる手がある
          }
        }
      }
    }
  }

  return true // 逃げる手がない = 詰み
}

// ステイルメイト判定: 王手はかかっていないが、合法手がない（引き分け）
export function isStalemate(board: BoardState, player: Player): boolean {
  // 王がいない場合はステイルメイトではない
  const kingPos = findKing(board, player)
  if (!kingPos) return false

  // 王手がかかっている場合はステイルメイトではない
  if (isInCheck(board, player)) return false

  // 自分の全ての駒について、合法手があるかチェック
  const boardSize = board.length

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        const from: Position = { row, col }
        const possibleMoves = getPossibleMoves(board, from, piece)

        // それぞれの移動について、自殺手でないかチェック
        for (const to of possibleMoves) {
          // 仮に移動してみる
          const testBoard = board.map(r => [...r])
          testBoard[to.row][to.col] = piece
          testBoard[from.row][from.col] = null

          // この移動で王手にならないか
          if (!isInCheck(testBoard, player)) {
            return false // 合法手がある
          }
        }
      }
    }
  }

  return true // 合法手がない = ステイルメイト
}

// 王の位置を探す
function findKing(board: BoardState, player: Player): Position | null {
  const boardSize = board.length
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player && (piece.type === 'king' || piece.type === 'chess_king')) {
        return { row, col }
      }
    }
  }
  return null
}
