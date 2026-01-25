/// AI Configuration for different strength levels
#[derive(Clone, Copy, Debug)]
pub struct AIConfig {
    pub level: u8,
    pub max_depth: u8,
    pub use_tt: bool,
    pub tt_size_mb: usize,
    pub use_pst: bool,
    pub use_killers: bool,
    pub qsearch_depth: u8,
    pub timeout_ms: u32, // Maximum thinking time in milliseconds
}

impl AIConfig {
    /// Create config from strength level (1-6)
    pub fn from_level(level: u8) -> Self {
        match level {
            1 => AIConfig {
                level: 1,
                max_depth: 3,
                use_tt: false,
                tt_size_mb: 0,
                use_pst: false,
                use_killers: false,
                qsearch_depth: 2,
                timeout_ms: 5000, // 5 seconds
            },
            2 => AIConfig {
                level: 2,
                max_depth: 3,
                use_tt: false,
                tt_size_mb: 0,
                use_pst: true,
                use_killers: false,
                qsearch_depth: 3,
                timeout_ms: 5000, // 5 seconds
            },
            3 => AIConfig {
                level: 3,
                max_depth: 4,
                use_tt: true,
                tt_size_mb: 1,
                use_pst: true,
                use_killers: false,
                qsearch_depth: 4,
                timeout_ms: 10000, // 10 seconds
            },
            4 => AIConfig {
                level: 4,
                max_depth: 4,
                use_tt: true,
                tt_size_mb: 2,
                use_pst: true,
                use_killers: true,
                qsearch_depth: 4,
                timeout_ms: 15000, // 15 seconds
            },
            5 => AIConfig {
                level: 5,
                max_depth: 5,
                use_tt: true,
                tt_size_mb: 4,
                use_pst: true,
                use_killers: true,
                qsearch_depth: 5,
                timeout_ms: 20000, // 20 seconds
            },
            6 => AIConfig {
                level: 6,
                max_depth: 6,
                use_tt: true,
                tt_size_mb: 8,
                use_pst: true,
                use_killers: true,
                qsearch_depth: 6,
                timeout_ms: 25000, // 25 seconds
            },
            _ => AIConfig::from_level(3), // Default to level 3
        }
    }

    #[allow(dead_code)]
    pub fn default() -> Self {
        Self::from_level(3)
    }
}
