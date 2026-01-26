import type { BoardState, Piece, Position, Move, Player } from '../types'
import { isValidPosition } from '../game/board'
import { getLegalMoves } from '../game/legalMoves'

// 簡易評価関数 - 駒の価値を評価
const PIECE_VALUES: Record<string, number> = {
  // 将棋
  king: 10000,
  rook: 500,
  bishop: 400,
  gold: 300,
  silver: 250,
  knight: 200,
  lance: 150,
  pawn: 100,
  // チェス
  chess_king: 10000,
  chess_queen: 900,
  chess_rook: 500,
  chess_bishop: 300,
  chess_knight: 300,
  chess_pawn: 100,
}

// 盤面を評価
function evaluateBoard(board: BoardState, player: Player): number {
  let score = 0
  const boardSize = board.length

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col]
      if (piece) {
        const value = PIECE_VALUES[piece.type] || 100
        const multiplier = piece.promoted ? 1.5 : 1
        const pieceScore = value * multiplier

        if (piece.player === player) {
          score += pieceScore
        } else {
          score -= pieceScore
        }
      }
    }
  }

  return score
}

// 可能な全ての手を生成（legalMoves.tsのgetLegalMovesを使用）
function generateMoves(board: BoardState, player: Player, initialBoard?: BoardState): Move[] {
  const moves: Move[] = []
  const boardSize = board.length

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        const from: Position = { row, col }
        // 修正: getPossibleMoves → getLegalMoves に変更して王手チェックを行う
        const legalMoves = getLegalMoves(board, from, piece, initialBoard)

        for (const to of legalMoves) {
          const targetPiece = board[to.row][to.col]
          moves.push({
            from,
            to,
            piece,
            captured: targetPiece || undefined,
          })
        }
      }
    }
  }

  return moves
}

// 手を適用
function applyMove(board: BoardState, move: Move): BoardState {
  const newBoard: BoardState = board.map(row => [...row])

  if (move.from) {
    newBoard[move.to.row][move.to.col] = move.piece
    newBoard[move.from.row][move.from.col] = null
  }

  return newBoard
}

// Minimaxアルゴリズム（簡易版）
function minimax(
  board: BoardState,
  depth: number,
  maximizingPlayer: boolean,
  player: Player,
  alpha: number = -Infinity,
  beta: number = Infinity,
  initialBoard?: BoardState
): number {
  if (depth === 0) {
    return evaluateBoard(board, player)
  }

  const currentPlayer: Player = maximizingPlayer ? player : (player === 1 ? 2 : 1)
  const moves = generateMoves(board, currentPlayer, initialBoard)

  if (moves.length === 0) {
    return evaluateBoard(board, player)
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity
    for (const move of moves) {
      const newBoard = applyMove(board, move)
      const evalScore = minimax(newBoard, depth - 1, false, player, alpha, beta, initialBoard)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break // Alpha-beta pruning
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const newBoard = applyMove(board, move)
      const evalScore = minimax(newBoard, depth - 1, true, player, alpha, beta, initialBoard)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break // Alpha-beta pruning
    }
    return minEval
  }
}

// AIが最善手を選択
export function getBestMove(board: BoardState, player: Player, difficulty: 'easy' | 'medium' | 'hard' = 'medium', initialBoard?: BoardState): Move | null {
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
  const moves = generateMoves(board, player, initialBoard)

  if (moves.length === 0) return null

  // 難易度に応じてランダム性を追加
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  let bestMove: Move | null = null
  let bestValue = -Infinity

  for (const move of moves) {
    const newBoard = applyMove(board, move)
    const moveValue = minimax(newBoard, depth - 1, false, player, -Infinity, Infinity, initialBoard)

    if (moveValue > bestValue) {
      bestValue = moveValue
      bestMove = move
    }
  }

  return bestMove
}

// ランダムな手を選択（最も簡単なAI）
export function getRandomMove(board: BoardState, player: Player, initialBoard?: BoardState): Move | null {
  const moves = generateMoves(board, player, initialBoard)
  if (moves.length === 0) return null
  return moves[Math.floor(Math.random() * moves.length)]
}
