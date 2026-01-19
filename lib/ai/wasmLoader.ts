/**
 * WASM AI Loader
 * Dynamically loads the WASM module for advanced AI
 */

let wasmModule: any = null;
let isLoading = false;
let loadError: Error | null = null;

export interface WasmAI {
  new(depth: number): WasmAI;
  get_best_move(boardJson: string): string;
  set_depth(depth: number): void;
  get_depth(): number;
}

export interface WasmModule {
  WasmAI: {
    new(depth: number): WasmAI;
  };
  init(): void;
}

/**
 * Load the WASM AI module
 * @returns Promise<WasmModule>
 */
export async function loadWasmAI(): Promise<WasmModule> {
  // Return cached module if already loaded
  if (wasmModule) {
    return wasmModule;
  }

  // Return error if previous load failed
  if (loadError) {
    throw loadError;
  }

  // Wait if currently loading
  if (isLoading) {
    // Poll until loaded or error
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (wasmModule) {
          clearInterval(checkInterval);
          resolve(wasmModule);
        } else if (loadError) {
          clearInterval(checkInterval);
          reject(loadError);
        }
      }, 100);
    });
  }

  try {
    isLoading = true;

    // @ts-ignore - WASM module
    const wasm = await import('../../wasm-ai/pkg');

    // Initialize WASM
    wasm.init();

    wasmModule = wasm;
    return wasm;
  } catch (error) {
    loadError = error as Error;
    console.error('Failed to load WASM:', error);
    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * Check if WASM is supported in the current browser
 */
export function isWasmSupported(): boolean {
  try {
    if (typeof WebAssembly === 'object' &&
      typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
      if (module instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    }
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * Preload WASM module (for optimization)
 */
export function preloadWasmAI(): void {
  if (!wasmModule && !isLoading) {
    loadWasmAI().catch(() => {
      // Ignore errors during preload
    });
  }
}
