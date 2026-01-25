/* tslint:disable */
/* eslint-disable */

/**
 * WASM AI wrapper
 */
export class WasmAI {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Get the best move for the current board state
     *
     * # Arguments
     * * `board_json` - JSON string representing the game state
     *
     * # Returns
     * JSON string with the best move, or error
     */
    get_best_move(board_json: string): string;
    /**
     * Get current search depth
     */
    get_depth(): number;
    /**
     * Get current strength level
     */
    get_level(): number;
    /**
     * Create a new AI instance with the specified strength level (1-6)
     */
    constructor(level: number);
    /**
     * Set custom depth (overrides level)
     */
    set_depth(depth: number): void;
    /**
     * Set the AI strength level (1-6)
     */
    set_level(level: number): void;
}

/**
 * Initialize panic hook for better error messages
 */
export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_wasmai_free: (a: number, b: number) => void;
    readonly init: () => void;
    readonly wasmai_get_best_move: (a: number, b: number, c: number) => [number, number, number, number];
    readonly wasmai_get_depth: (a: number) => number;
    readonly wasmai_get_level: (a: number) => number;
    readonly wasmai_new: (a: number) => number;
    readonly wasmai_set_depth: (a: number, b: number) => void;
    readonly wasmai_set_level: (a: number, b: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
