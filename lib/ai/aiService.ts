/**
 * AI Service
 * Unified interface for Simple AI and WASM AI
 */

import type { BoardState, Move, Player } from '../types';
import { getBestMove as getSimpleBestMove } from './simpleAI';
import { isWasmSupported } from './wasmLoader';

export type AIType = 'simple' | 'advanced';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type AILevel = 1 | 2 | 3 | 4 | 5 | 6;

interface AIServiceConfig {
  type: AIType;
  difficulty?: AIDifficulty;  // Legacy support
  level?: AILevel;            // NEW: Level-based (1-6)
  depth?: number;             // For WASM AI (optional override)
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
          } else if (type === 'CHECKMATE') {
            // AI has no legal moves - this means the AI is checkmated
            console.log('AI has no legal moves (checkmated)');
            if (this.pendingResolve) {
              this.pendingResolve(null); // Return null to indicate checkmate
              this.pendingResolve = null;
            }
          } else if (type === 'ERROR') {
            console.error('Worker error:', e.data.error);
            if (!this.isReady) {
              reject(new Error(e.data.error));
            } else if (this.pendingResolve) {
              // Resolve with null on error during move generation
              this.pendingResolve(null);
              this.pendingResolve = null;
            }
          }
        };

        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
          reject(error);
        };

        // Initialize worker with level (prefer level, fallback to difficulty)
        let level: number;
        if (this.config.level) {
          level = this.config.level;
        } else if (this.config.depth) {
          // Legacy: depth override
          level = this.depthToLevel(this.config.depth);
        } else if (this.config.difficulty) {
          // Legacy: convert difficulty to level
          level = this.difficultyToLevel(this.config.difficulty);
        } else {
          level = 3; // Default: Level 3 (Normal)
        }

        this.worker.postMessage({
          type: 'INIT',
          level,
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
   * Update AI level
   */
  setLevel(level: AILevel): void {
    this.config.level = level;

    if (this.worker && this.isReady) {
      this.worker.postMessage({
        type: 'SET_LEVEL',
        level,
      });
    }
  }

  /**
   * Update AI difficulty (legacy)
   */
  setDifficulty(difficulty: AIDifficulty): void {
    this.config.difficulty = difficulty;
    const level = this.difficultyToLevel(difficulty);
    this.setLevel(level);
  }

  /**
   * Convert difficulty to level
   */
  private difficultyToLevel(difficulty: AIDifficulty): AILevel {
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
   * Convert depth to level (approximate)
   */
  private depthToLevel(depth: number): AILevel {
    if (depth <= 2) return 1;
    if (depth === 3) return 3;
    if (depth === 4) return 4;
    if (depth === 5) return 5;
    if (depth >= 6) return 6;
    return 3;
  }

  /**
   * Convert difficulty to search depth (legacy)
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
