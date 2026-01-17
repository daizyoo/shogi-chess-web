-- Migration 004: Enable RLS on rooms table and add security policies
-- Purpose: セキュリティ強化のためRow Level Securityを有効化

-- Enable RLS on rooms table
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Policy: 全員がルーム一覧を閲覧可能
CREATE POLICY "Anyone can view rooms"
  ON public.rooms
  FOR SELECT
  USING (true);

-- Policy: 認証済みユーザーがルームを作成可能
CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: プレイヤーが自分の参加しているルームを更新可能
CREATE POLICY "Players can update their rooms"
  ON public.rooms
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = player1_id 
    OR auth.uid()::text = player2_id
  );

-- Policy: プレイヤーが自分の参加しているルームを削除可能
CREATE POLICY "Players can delete their rooms"
  ON public.rooms
  FOR DELETE
  TO authenticated
  USING (
    auth.uid()::text = player1_id 
    OR auth.uid()::text = player2_id
  );

-- Enable RLS on game_states table
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

-- Policy: 全員がゲーム状態を閲覧可能
CREATE POLICY "Anyone can view game states"
  ON public.game_states
  FOR SELECT
  USING (true);

-- Policy: 認証済みユーザーがゲーム状態を作成可能
CREATE POLICY "Authenticated users can create game states"
  ON public.game_states
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: 認証済みユーザーがゲーム状態を更新可能
CREATE POLICY "Authenticated users can update game states"
  ON public.game_states
  FOR UPDATE
  TO authenticated
  USING (true);

-- Enable RLS on moves table
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;

-- Policy: 全員が手の履歴を閲覧可能
CREATE POLICY "Anyone can view moves"
  ON public.moves
  FOR SELECT
  USING (true);

-- Policy: 認証済みユーザーが手を記録可能
CREATE POLICY "Authenticated users can insert moves"
  ON public.moves
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: custom_boards and profiles tables already have RLS enabled in MIGRATION_002
-- We only need to enable RLS for rooms, game_states, and moves tables here

