export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          board_type: string
          has_hand_pieces: boolean
          player1_id: string | null
          player2_id: string | null
          status: string
          current_turn: number
          created_at: string
          updated_at: string
          last_activity_at: string
        }
        Insert: {
          id?: string
          name: string
          board_type: string
          has_hand_pieces?: boolean
          player1_id?: string | null
          player2_id?: string | null
          status?: string
          current_turn?: number
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
        Update: {
          id?: string
          name?: string
          board_type?: string
          has_hand_pieces?: boolean
          player1_id?: string | null
          player2_id?: string | null
          status?: string
          current_turn?: number
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
      }
      game_states: {
        Row: {
          id: string
          room_id: string
          board: Json
          hands: Json
          status: string
          winner: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          board: Json
          hands: Json
          status?: string
          winner?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          board?: Json
          hands?: Json
          status?: string
          winner?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      moves: {
        Row: {
          id: string
          room_id: string
          player: number
          from_row: number | null
          from_col: number | null
          to_row: number
          to_col: number
          piece_type: string
          promoted: boolean
          captured_piece: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          player: number
          from_row?: number | null
          from_col?: number | null
          to_row: number
          to_col: number
          piece_type: string
          promoted?: boolean
          captured_piece?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          player?: number
          from_row?: number | null
          from_col?: number | null
          to_row?: number
          to_col?: number
          piece_type?: string
          promoted?: boolean
          captured_piece?: string | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
  }
}
