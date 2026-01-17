# Custom Board Editor - Usage Guide

## Accessing the Editor

Navigate to: http://localhost:3000/editor

## How to Use

### 1. Select a Template

- **Load Shogi Template**: 9x9 board with standard Shogi setup
- **Load Chess Template**: 8x8 board with standard Chess setup
- **Clear Board**: Empty board

### 2. Configure Players

- **Player 1 (Upper case letters)**: White/先手
  - Check "Shogi pieces" to use Shogi piece set
  - Check "Use hand pieces" to enable captured piece drops
- **Player 2 (Lower case letters)**: Black/後手
  - Same configuration options as Player 1

### 3. Edit the Board

1. Select a piece from the palette
2. Click on any cell to place the piece
3. Use the Eraser to remove pieces

### 4. Export/Import

- **Export JSON**: Download board as JSON file
- **Import JSON**: Load a saved board from JSON file

## JSON Format (Rust Compatible)

```json
{
  "name": "Custom Board",
  "board": [
    "cr cn cb cq ck cb cn cr",
    "cp cp cp cp cp cp cp cp",
    ". . . . . . . .",
    ". . . . . . . .",
    ". . . . . . . .",
    ". . . . . . . .",
    "CP CP CP CP CP CP CP CP",
    "CR CN CB CQ CK CB CN CR"
  ],
  "player1": {
    "isShogi": false,
    "useHandPieces": false
  },
  "player2": {
    "isShogi": false,
    "useHandPieces": false
  }
}
```

## Piece Notation

### Shogi Pieces

- `K/k` = 玉 King
- `R/r` = 飛 Rook
- `B/b` = 角 Bishop
- `G/g` = 金 Gold
- `S/s` = 銀 Silver
- `N/n` = 桂 Knight
- `L/l` = 香 Lance
- `P/p` = 歩 Pawn

### Chess Pieces

- `CK/ck` = ♔ King
- `CQ/cq` = ♕ Queen
- `CR/cr` = ♖ Rook
- `CB/cb` = ♗ Bishop
- `CN/cn` = ♘ Knight
- `CP/cp` = ♙ Pawn

### Key

- **Upper case** = Player 1 (先手)
- **Lower case** = Player 2 (後手)
- **`.`** = Empty square

## Using with Rust Version (Future)

Save the JSON file and load it in the Rust version:

```rust
// Example Rust code (to be implemented)
let json = std::fs::read_to_string("custom_board.json")?;
let custom: CustomBoardSetup = serde_json::from_str(&json)?;
let board = setup_from_strings(
    &custom.board.iter().map(|s| s.as_str()).collect::<Vec<_>>(),
    custom.player1.is_shogi,
    custom.player2.is_shogi,
    Some(custom.player1.use_hand_pieces),
    Some(custom.player2.use_hand_pieces),
);
```
