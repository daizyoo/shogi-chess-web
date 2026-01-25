use crate::types::Move;

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Bound {
    Exact,
    Lower,
    Upper,
}

#[derive(Clone, Debug)]
pub struct TTEntry {
    pub hash: u64,
    pub depth: u8,
    pub score: i32,
    pub bound: Bound,
    pub best_move: Option<Move>,
}

pub struct TranspositionTable {
    entries: Vec<Option<TTEntry>>,
    size: usize,
}

impl TranspositionTable {
    /// Create a new transposition table
    /// size_mb: size in megabytes
    pub fn new(size_mb: usize) -> Self {
        if size_mb == 0 {
            return TranspositionTable {
                entries: Vec::new(),
                size: 0,
            };
        }

        // Calculate number of entries based on size
        let entry_size = std::mem::size_of::<Option<TTEntry>>();
        let num_entries = (size_mb * 1024 * 1024) / entry_size;

        TranspositionTable {
            entries: vec![None; num_entries],
            size: num_entries,
        }
    }

    pub fn is_enabled(&self) -> bool {
        self.size > 0
    }

    fn get_index(&self, hash: u64) -> usize {
        (hash as usize) % self.size
    }

    pub fn get(&self, hash: u64) -> Option<&TTEntry> {
        if !self.is_enabled() {
            return None;
        }

        let idx = self.get_index(hash);
        if let Some(ref entry) = self.entries[idx] {
            if entry.hash == hash {
                return Some(entry);
            }
        }
        None
    }

    pub fn store(
        &mut self,
        hash: u64,
        depth: u8,
        score: i32,
        bound: Bound,
        best_move: Option<Move>,
    ) {
        if !self.is_enabled() {
            return;
        }

        let idx = self.get_index(hash);

        // Replacement scheme: prefer deeper searches
        let should_replace = match &self.entries[idx] {
            None => true,
            Some(existing) => existing.hash != hash || depth >= existing.depth,
        };

        if should_replace {
            self.entries[idx] = Some(TTEntry {
                hash,
                depth,
                score,
                bound,
                best_move,
            });
        }
    }

    pub fn clear(&mut self) {
        for entry in &mut self.entries {
            *entry = None;
        }
    }
}
