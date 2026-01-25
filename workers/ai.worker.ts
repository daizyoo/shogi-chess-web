/**
 * AI WebWorker
 * Runs WASM AI in background thread to prevent UI blocking
 */

import { loadWasmAI, type WasmModule } from '@/lib/ai/wasmLoader';

let wasmAI: any = null;
let wasmModule: WasmModule | null = null;

// Message types
interface InitMessage {
  type: 'INIT';
  level: number;
}

interface GetMoveMessage {
  type: 'GET_MOVE';
  boardJson: string;
}

interface SetLevelMessage {
  type: 'SET_LEVEL';
  level: number;
}

interface SetDepthMessage {
  type: 'SET_DEPTH';
  depth: number;
}

type WorkerMessage = InitMessage | GetMoveMessage | SetLevelMessage | SetDepthMessage;

// Response types
interface ReadyResponse {
  type: 'READY';
}

interface MoveResponse {
  type: 'MOVE';
  move: string;
}

interface ErrorResponse {
  type: 'ERROR';
  error: string;
}

type WorkerResponse = ReadyResponse | MoveResponse | ErrorResponse;

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;

  try {
    switch (type) {
      case 'INIT':
        await handleInit(e.data.level);
        break;

      case 'GET_MOVE':
        await handleGetMove(e.data.boardJson);
        break;

      case 'SET_LEVEL':
        handleSetLevel(e.data.level);
        break;

      case 'SET_DEPTH':
        handleSetDepth(e.data.depth);
        break;

      default:
        postError(`Unknown message type: ${type}`);
    }
  } catch (error) {
    postError(error instanceof Error ? error.message : String(error));
  }
};

async function handleInit(level: number) {
  try {
    // Load WASM module
    wasmModule = await loadWasmAI();

    // Create AI instance with level
    wasmAI = new wasmModule.WasmAI(level);

    // Notify main thread that worker is ready
    const response: ReadyResponse = { type: 'READY' };
    self.postMessage(response);
  } catch (error) {
    postError(`Failed to initialize WASM AI: ${error}`);
  }
}

async function handleGetMove(boardJson: string) {
  if (!wasmAI) {
    postError('AI not initialized. Call INIT first.');
    return;
  }

  try {
    // Get best move from WASM AI
    const moveJson = wasmAI.get_best_move(boardJson);

    // Send move back to main thread
    const response: MoveResponse = {
      type: 'MOVE',
      move: moveJson,
    };
    self.postMessage(response);
  } catch (error) {
    // Check if this is a "no legal moves" error (checkmate/stalemate)
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('No legal moves available')) {
      // This is checkmate or stalemate - AI has no moves
      // Return a special response indicating game over
      const response = {
        type: 'CHECKMATE',
        message: 'AI has no legal moves (checkmated)',
      };
      self.postMessage(response);
    } else {
      // Other errors should still be reported as errors
      postError(`Failed to get move: ${error}`);
    }
  }
}

function handleSetLevel(level: number) {
  if (!wasmAI) {
    postError('AI not initialized. Call INIT first.');
    return;
  }

  try {
    wasmAI.set_level(level);
  } catch (error) {
    postError(`Failed to set level: ${error}`);
  }
}

function handleSetDepth(depth: number) {
  if (!wasmAI) {
    postError('AI not initialized. Call INIT first.');
    return;
  }

  try {
    wasmAI.set_depth(depth);
  } catch (error) {
    postError(`Failed to set depth: ${error}`);
  }
}

function postError(errorMessage: string) {
  const response: ErrorResponse = {
    type: 'ERROR',
    error: errorMessage,
  };
  self.postMessage(response);
}
