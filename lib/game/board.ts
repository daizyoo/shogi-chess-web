import type { BoardState, Piece, Position, PieceType, Player } from '../types'

// 盤のサイズを取得
export function getBoardSize(boardType: 'shogi' | 'chess' | 'custom', customSize?: number): number {
  if (boardType === 'custom' && customSize) return customSize
  return boardType === 'chess' ? 8 : 9
}

// 初期盤面を作成
export function createInitialBoard(boardType: 'shogi' | 'chess' | 'custom', customData?: any): BoardState {
  if (boardType === 'custom' && customData) {
    return setupBoardFromStrings(customData.board)
  }

  const size = getBoardSize(boardType)
  const board: BoardState = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null))

  if (boardType === 'shogi') {
    return createShogiBoard()
  } else if (boardType === 'chess') {
    return createChessBoard()
  }

  return board
}

// 文字列配列から盤面を構成する
export function setupBoardFromStrings(boardStrings: string[]): BoardState {
  const size = boardStrings.length
  const board: BoardState = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null))

  const pieceMap: Record<string, PieceType> = {
    'K': 'king', 'R': 'rook', 'B': 'bishop', 'G': 'gold', 'S': 'silver', 'N': 'knight', 'L': 'lance', 'P': 'pawn',
    'CK': 'chess_king', 'CQ': 'chess_queen', 'CR': 'chess_rook', 'CB': 'chess_bishop', 'CN': 'chess_knight', 'CP': 'chess_pawn'
  }

  boardStrings.forEach((rowStr, r) => {
    const cells = rowStr.trim().split(/\s+/)
    cells.forEach((cell, c) => {
      if (cell === '.') return

      const player = cell === cell.toUpperCase() ? 1 : 2
      const typeStr = cell.toUpperCase()
      const type = pieceMap[typeStr]

      if (type) {
        board[r][c] = { type, player }
      }
    })
  })

  return board
}

function createShogiBoard(): BoardState {
  const board: BoardState = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null))

  // Player 2 (上側)
  board[0][0] = { type: 'lance', player: 2 }
  board[0][1] = { type: 'knight', player: 2 }
  board[0][2] = { type: 'silver', player: 2 }
  board[0][3] = { type: 'gold', player: 2 }
  board[0][4] = { type: 'king', player: 2 }
  board[0][5] = { type: 'gold', player: 2 }
  board[0][6] = { type: 'silver', player: 2 }
  board[0][7] = { type: 'knight', player: 2 }
  board[0][8] = { type: 'lance', player: 2 }

  board[1][1] = { type: 'rook', player: 2 }
  board[1][7] = { type: 'bishop', player: 2 }

  for (let i = 0; i < 9; i++) {
    board[2][i] = { type: 'pawn', player: 2 }
  }

  // Player 1 (下側)
  for (let i = 0; i < 9; i++) {
    board[6][i] = { type: 'pawn', player: 1 }
  }

  board[7][1] = { type: 'bishop', player: 1 }
  board[7][7] = { type: 'rook', player: 1 }

  board[8][0] = { type: 'lance', player: 1 }
  board[8][1] = { type: 'knight', player: 1 }
  board[8][2] = { type: 'silver', player: 1 }
  board[8][3] = { type: 'gold', player: 1 }
  board[8][4] = { type: 'king', player: 1 }
  board[8][5] = { type: 'gold', player: 1 }
  board[8][6] = { type: 'silver', player: 1 }
  board[8][7] = { type: 'knight', player: 1 }
  board[8][8] = { type: 'lance', player: 1 }

  return board
}

function createChessBoard(): BoardState {
  const board: BoardState = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Player 2 (Black, top)
  board[0][0] = { type: 'chess_rook', player: 2 }
  board[0][1] = { type: 'chess_knight', player: 2 }
  board[0][2] = { type: 'chess_bishop', player: 2 }
  board[0][3] = { type: 'chess_queen', player: 2 }
  board[0][4] = { type: 'chess_king', player: 2 }
  board[0][5] = { type: 'chess_bishop', player: 2 }
  board[0][6] = { type: 'chess_knight', player: 2 }
  board[0][7] = { type: 'chess_rook', player: 2 }

  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'chess_pawn', player: 2 }
  }

  // Player 1 (White, bottom)
  for (let i = 0; i < 8; i++) {
    board[6][i] = { type: 'chess_pawn', player: 1 }
  }

  board[7][0] = { type: 'chess_rook', player: 1 }
  board[7][1] = { type: 'chess_knight', player: 1 }
  board[7][2] = { type: 'chess_bishop', player: 1 }
  board[7][3] = { type: 'chess_queen', player: 1 }
  board[7][4] = { type: 'chess_king', player: 1 }
  board[7][5] = { type: 'chess_bishop', player: 1 }
  board[7][6] = { type: 'chess_knight', player: 1 }
  board[7][7] = { type: 'chess_rook', player: 1 }

  return board
}



// 駒の表示名を取得
export function getPieceName(type: PieceType, promoted?: boolean): string {
  if (promoted) {
    const promotedNames: Record<string, string> = {
      pawn: 'と',
      lance: '成香',
      knight: '成桂',
      silver: '成銀',
      rook: '竜',
      bishop: '馬',
    }
    return promotedNames[type] || type
  }

  const names: Record<PieceType, string> = {
    // Shogi
    king: '王',
    rook: '飛',
    bishop: '角',
    gold: '金',
    silver: '銀',
    knight: '桂',
    lance: '香',
    pawn: '歩',
    // Chess
    chess_king: '♔',
    chess_queen: '♕',
    chess_rook: '♖',
    chess_bishop: '♗',
    chess_knight: '♘',
    chess_pawn: '♙',
  }

  return names[type] || type
}

// 座標が盤面内かチェック
export function isValidPosition(pos: Position, boardSize: number = 9): boolean {
  return pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize
}

// 基本的な移動可能マスを取得
export function getPossibleMoves(
  board: BoardState,
  pos: Position,
  piece: Piece
): Position[] {
  const moves: Position[] = []
  const boardSize = board.length
  const { type, player, promoted } = piece

  // プレイヤー1は下から上へ、プレイヤー2は上から下へ
  const direction = player === 1 ? -1 : 1

  // 成り駒の処理
  if (promoted) {
    // と金、成香、成桂、成銀は全て金将と同じ動き
    if (type === 'pawn' || type === 'lance' || type === 'knight' || type === 'silver') {
      // 金将の動き
      addMoveIfValid(board, moves, pos.row + direction, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row + direction, pos.col, player, boardSize)
      addMoveIfValid(board, moves, pos.row + direction, pos.col + 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row, pos.col + 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row - direction, pos.col, player, boardSize)
      return moves
    }

    // 竜王（成り飛車）: 飛車の動き + 斜め1マス
    if (type === 'rook') {
      addLineMoves(board, moves, pos, [[-1, 0], [1, 0], [0, -1], [0, 1]], player, boardSize)
      addMoveIfValid(board, moves, pos.row - 1, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row - 1, pos.col + 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row + 1, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row + 1, pos.col + 1, player, boardSize)
      return moves
    }

    // 竜馬（成り角）: 角の動き + 縦横1マス
    if (type === 'bishop') {
      addLineMoves(board, moves, pos, [[-1, -1], [-1, 1], [1, -1], [1, 1]], player, boardSize)
      addMoveIfValid(board, moves, pos.row - 1, pos.col, player, boardSize)
      addMoveIfValid(board, moves, pos.row + 1, pos.col, player, boardSize)
      addMoveIfValid(board, moves, pos.row, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row, pos.col + 1, player, boardSize)
      return moves
    }
  }

  switch (type) {
    case 'pawn': // 将棋の歩
      // 前方1マス
      addMoveIfValid(board, moves, pos.row + direction, pos.col, player, boardSize)
      break

    case 'lance': // 将棋の香車
      // 前方に直進
      for (let i = 1; i < boardSize; i++) {
        const newRow = pos.row + direction * i
        if (!addMoveIfValid(board, moves, newRow, pos.col, player, boardSize)) {
          break // 駒があったら止まる
        }
      }
      break

    case 'knight': // 将棋の桂馬
      // 前方2マス、左右1マスのL字
      addMoveIfValid(board, moves, pos.row + direction * 2, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row + direction * 2, pos.col + 1, player, boardSize)
      break

    case 'silver': // 将棋の銀将
      // 前方3方向、斜め後ろ2方向
      addMoveIfValid(board, moves, pos.row + direction, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row + direction, pos.col, player, boardSize)
      addMoveIfValid(board, moves, pos.row + direction, pos.col + 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row - direction, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row - direction, pos.col + 1, player, boardSize)
      break

    case 'gold': // 将棋の金将
      // 前方3方向、横2方向、後ろ1方向
      addMoveIfValid(board, moves, pos.row + direction, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row + direction, pos.col, player, boardSize)
      addMoveIfValid(board, moves, pos.row + direction, pos.col + 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row, pos.col - 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row, pos.col + 1, player, boardSize)
      addMoveIfValid(board, moves, pos.row - direction, pos.col, player, boardSize)
      break

    case 'bishop': // 将棋の角行
    case 'chess_bishop': // チェスのビショップ
      // 斜め4方向に直進
      addLineMoves(board, moves, pos, [[-1, -1], [-1, 1], [1, -1], [1, 1]], player, boardSize)
      break

    case 'rook': // 将棋の飛車
    case 'chess_rook': // チェスのルーク
      // 縦横4方向に直進
      addLineMoves(board, moves, pos, [[-1, 0], [1, 0], [0, -1], [0, 1]], player, boardSize)
      break

    case 'king': // 将棋の王
    case 'chess_king': // チェスのキング
      // 全方向1マス
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          addMoveIfValid(board, moves, pos.row + dr, pos.col + dc, player, boardSize)
        }
      }
      break

    case 'chess_queen': // チェスのクイーン
      // 縦横斜め8方向に直進（ルーク+ビショップ）
      addLineMoves(board, moves, pos, [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ], player, boardSize)
      break

    case 'chess_knight': // チェスのナイト
      // L字形の8方向
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      for (const [dr, dc] of knightMoves) {
        addMoveIfValid(board, moves, pos.row + dr, pos.col + dc, player, boardSize)
      }
      break

    case 'chess_pawn': // チェスのポーン
      // 前方1マス（まだ動いていない場合は2マス）
      const startRow = player === 1 ? 6 : 1
      const newRow = pos.row + direction

      // 前方1マス（駒がない場合のみ）
      if (isValidPosition({ row: newRow, col: pos.col }, boardSize)) {
        const target = board[newRow][pos.col]
        if (!target) {
          moves.push({ row: newRow, col: pos.col })
        }
      }

      // 初期位置から2マス
      if (pos.row === startRow) {
        const twoRow = pos.row + direction * 2
        if (isValidPosition({ row: twoRow, col: pos.col }, boardSize)) {
          const middle = board[pos.row + direction][pos.col]
          const target = board[twoRow][pos.col]
          if (!middle && !target) {
            moves.push({ row: twoRow, col: pos.col })
          }
        }
      }

      // 斜め前の敵駒を取る
      for (const dc of [-1, 1]) {
        if (isValidPosition({ row: newRow, col: pos.col + dc }, boardSize)) {
          const target = board[newRow][pos.col + dc]
          if (target && target.player !== player) {
            moves.push({ row: newRow, col: pos.col + dc })
          }
        }
      }
      break
  }

  return moves
}

// ヘルパー関数: 1マス移動が可能かチェックして追加
function addMoveIfValid(
  board: BoardState,
  moves: Position[],
  row: number,
  col: number,
  player: Player,
  boardSize: number
): boolean {
  if (!isValidPosition({ row, col }, boardSize)) {
    return false
  }

  const target = board[row][col]
  if (!target) {
    moves.push({ row, col })
    return true // 空マスなので続行可能
  } else if (target.player !== player) {
    moves.push({ row, col })
    return false // 敵駒で止まる
  }
  return false // 味方の駒で止まる
}

// ヘルパー関数: 直線移動（飛車、角、クイーンなど）
function addLineMoves(
  board: BoardState,
  moves: Position[],
  pos: Position,
  directions: number[][],
  player: Player,
  boardSize: number
) {
  for (const [dr, dc] of directions) {
    for (let i = 1; i < boardSize; i++) {
      const newRow = pos.row + dr * i
      const newCol = pos.col + dc * i

      if (!addMoveIfValid(board, moves, newRow, newCol, player, boardSize)) {
        break
      }
    }
  }
}
