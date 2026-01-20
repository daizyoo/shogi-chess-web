use wasm_bindgen::prelude::*;

mod board;
mod config;
mod eval;
mod moves;
mod pst;
mod search;
mod tt;
mod types;
mod zobrist;

use types::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator.
// This is a tiny allocator for WASM that helps reduce binary size.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// WASM AI wrapper
#[wasm_bindgen]
pub struct WasmAI {
    config: config::AIConfig,
}

#[wasm_bindgen]
impl WasmAI {
    /// Create a new AI instance with the specified strength level (1-6)
    #[wasm_bindgen(constructor)]
    pub fn new(level: u8) -> Self {
        Self {
            config: config::AIConfig::from_level(level),
        }
    }

    /// Get the best move for the current board state
    ///
    /// # Arguments
    /// * `board_json` - JSON string representing the game state
    ///
    /// # Returns
    /// JSON string with the best move, or error
    #[wasm_bindgen]
    pub fn get_best_move(&mut self, board_json: &str) -> Result<String, JsValue> {
        let game_state: GameStateInput = serde_json::from_str(board_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse board: {}", e)))?;

        let board = board::Board::from_game_state(&game_state)?;
        let best_move = search::find_best_move(&board, game_state.current_player, &self.config)?;

        let move_output = MoveOutput::from_move(&best_move);
        serde_json::to_string(&move_output)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize move: {}", e)))
    }

    /// Set the AI strength level (1-6)
    #[wasm_bindgen]
    pub fn set_level(&mut self, level: u8) {
        self.config = config::AIConfig::from_level(level);
    }

    /// Get current strength level
    #[wasm_bindgen]
    pub fn get_level(&self) -> u8 {
        self.config.level
    }

    /// Set custom depth (overrides level)
    #[wasm_bindgen]
    pub fn set_depth(&mut self, depth: u8) {
        self.config.max_depth = depth.max(1).min(8);
    }

    /// Get current search depth
    #[wasm_bindgen]
    pub fn get_depth(&self) -> u8 {
        self.config.max_depth
    }
}
