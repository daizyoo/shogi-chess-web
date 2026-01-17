import type { BoardState, Player, Position, Piece } from '../types'
import { getPossibleMoves } from './board'
import { isInCheck } from './checkmate'

/**
 * 合法手のみを返す関数
 * getPossibleMoves() で得られた手から、自分の王を危険にさらす手を除外する
 */
export function getLegalMoves(
  board: BoardState,
  from: Position,
  piece: Piece
): Position[] {
  // まず全ての可能な手を取得
  const possibleMoves = getPossibleMoves(board, from, piece)

  // 各手について、その手が自分の王を危険にさらさないかチェック
  const legalMoves = possibleMoves.filter(to => {
    // 仮に移動してみる
    const testBoard = board.map(row => [...row])
    testBoard[to.row][to.col] = piece
    testBoard[from.row][from.col] = null

    // この移動後に自分の王が王手にならないかチェック
    return !isInCheck(testBoard, piece.player)
  })

  return legalMoves
}
