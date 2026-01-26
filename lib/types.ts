import type { PieceTypePromotionZones } from './board/types'

// 駒の種類
export type PieceType =
  // 将棋の駒
  | 'king' | 'rook' | 'bishop' | 'gold' | 'silver' | 'knight' | 'lance' | 'pawn'
  // チェスの駒
  | 'chess_king' | 'chess_queen' | 'chess_rook' | 'chess_bishop' | 'chess_knight' | 'chess_pawn';

// プレイヤー
export type Player = 1 | 2;

// 駒の情報
export interface Piece {
  type: PieceType;
  player: Player;
  promoted?: boolean; // 成り駒
}

// 盤上の位置
export interface Position {
  row: number; // 0-8
  col: number; // 0-8
}

// 駒の移動
export interface Move {
  from: Position | null; // nullの場合は持ち駒から
  to: Position;
  piece: Piece;
  captured?: Piece; // 取った駒
  promote?: boolean; // 成るかどうか
}

// 盤面の状態
export type BoardState = (Piece | null)[][];

// 持ち駒
export interface HandPieces {
  [key: string]: number; // piece type -> count
}

// ゲームの状態
export interface GameState {
  board: BoardState;
  hands: {
    1: HandPieces;
    2: HandPieces;
  };
  currentTurn: Player;
  moves: Move[];
  status: 'waiting' | 'playing' | 'finished';
  winner?: Player | 'draw';
  promotionZones?: {
    player1: PieceTypePromotionZones;
    player2: PieceTypePromotionZones;
  };
  lastMove?: Move; // 最後に指された手（ハイライト表示用）
  initialBoard?: BoardState; // 初期盤面（カスタムボードのポーン判定用）
}

// 盤の種類
export type BoardType = 'shogi' | 'chess' | 'custom';

// カスタム盤の設定
export interface CustomBoardConfig {
  id?: string;
  name: string;
  board: BoardState;
  hasHandPieces: boolean;
  creatorId?: string;
  isPublic?: boolean;
}

// ルーム情報
export interface Room {
  id: string;
  name: string;
  boardType: BoardType;
  customBoardId?: string;
  hasHandPieces: boolean;
  player1Id: string | null;
  player2Id: string | null;
  status: 'waiting' | 'playing' | 'finished';
  gameState?: GameState;
  createdAt: Date;
}

// Socket.io イベント型定義
export interface ServerToClientEvents {
  roomList: (rooms: Room[]) => void;
  roomJoined: (room: Room) => void;
  gameStateUpdate: (gameState: GameState) => void;
  playerJoined: (playerId: string, playerNumber: Player) => void;
  playerLeft: (playerId: string) => void;
  gameOver: (winner: Player | 'draw') => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  getRooms: () => void;
  createRoom: (roomData: Partial<Room>) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  makeMove: (roomId: string, move: Move) => void;
}
