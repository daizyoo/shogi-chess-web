/**
 * AI Service
 * Unified interface for Simple AI and WASM AI
 */

import type { BoardState, Move, Player } from '../types';
import { getBestMove as getSimpleBestMove } from './simpleAI';
import { isWasmSupported } from './wasmLoader';

export type AIType = 'simple' | 'advanced';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface AIServiceConfig {
  type: AIType;
  difficulty?: AIDifficulty;
  depth?: number; // For WASM AI
}

export class AIService {
  private worker: Worker | null = null;
  private config: AIServiceConfig;
  private isReady: boolean = false;
  private pendingResolve: ((move: Move | null) => void) | null = null;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  /**
   * Initialize the AI service
   */
  async initialize(): Promise<void> {
    if (this.config.type === 'advanced') {
      if (!isWasmSupported()) {
        console.warn('WASM not supported, falling back to simple AI');
        this.config.type = 'simple';
        return;
      }

      try {
        await this.initializeWorker();
      } catch (error) {
        console.error('Failed to initialize WASM AI:', error);
        console.warn('Falling back to simple AI');
        this.config.type = 'simple';
      }
    }
  }

  /**
   * Initialize WebWorker for WASM AI
   */
  private async initializeWorker(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(
          new URL('../../workers/ai.worker.ts', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = (e) => {
          const { type } = e.data;

          if (type === 'READY') {
            this.isReady = true;
            resolve();
          } else if (type === 'MOVE') {
            this.handleMoveResponse(e.data.move);
          } else if (type === 'ERROR') {
            console.error('Worker error:', e.data.error);
            if (!this.isReady) {
              reject(new Error(e.data.error));
            }
          }
        };

        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
          reject(error);
        };

        // Initialize worker with depth
        const depth = this.config.depth || this.depthFromDifficulty(this.config.difficulty || 'medium');
        this.worker.postMessage({
          type: 'INIT',
          depth,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Normalize board state for WASM
   * Ensures all pieces have required fields (e.g., promoted)
   */
  private normalizeBoard(board: BoardState): BoardState {
    return board.map(row =>
      row.map(piece =>
        piece ? {
          ...piece,
          promoted: piece.promoted ?? false
        } : null
      )
    );
  }

  /**
   * Get best move for current board state
   */
  async getBestMove(board: BoardState, player: Player): Promise<Move | null> {
    if (this.config.type === 'simple' || !this.worker) {
      return getSimpleBestMove(board, player, this.config.difficulty || 'medium');
    }

    return new Promise((resolve) => {
      this.pendingResolve = resolve;

      // Normalize board and convert to JSON for WASM
      const normalizedBoard = this.normalizeBoard(board);
      const boardJson = JSON.stringify({
        board: normalizedBoard,
        currentPlayer: player,
      });

      this.worker!.postMessage({
        type: 'GET_MOVE',
        boardJson,
      });
    });
  }

  /**
   * Handle move response from worker
   */
  private handleMoveResponse(moveJson: string): void {
    if (!this.pendingResolve) return;

    try {
      const move = JSON.parse(moveJson);

      // Convert WASM move format to app Move format
      const appMove: Move = {
        from: move.from,
        to: move.to,
        piece: {
          type: move.pieceType,
          player: 1, // Will be set by caller
          promoted: move.promoted,
        },
        captured: undefined, // Will be determined by caller
      };

      this.pendingResolve(appMove);
      this.pendingResolve = null;
    } catch (error) {
      console.error('Failed to parse move:', error);
      if (this.pendingResolve) {
        this.pendingResolve(null);
        this.pendingResolve = null;
      }
    }
  }

  /**
   * Update AI difficulty
   */
  setDifficulty(difficulty: AIDifficulty): void {
    this.config.difficulty = difficulty;

    if (this.worker && this.isReady) {
      const depth = this.depthFromDifficulty(difficulty);
      this.worker.postMessage({
        type: 'SET_DEPTH',
        depth,
      });
    }
  }

  /**
   * Convert difficulty to search depth
   */
  private depthFromDifficulty(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case 'easy':
        return 2;
      case 'medium':
        return 3;
      case 'hard':
        return 4;
      default:
        return 3;
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }
}

/**
 * Create AI service with configuration
 */
export async function createAIService(config: AIServiceConfig): Promise<AIService> {
  const service = new AIService(config);
  await service.initialize();
  return service;
}
