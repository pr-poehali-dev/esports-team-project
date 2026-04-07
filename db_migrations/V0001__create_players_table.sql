
CREATE TABLE t_p13298661_esports_team_project.players (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    rank VARCHAR(50),
    rating INTEGER DEFAULT 0,
    kd_ratio NUMERIC(4,2) DEFAULT 0,
    winrate INTEGER DEFAULT 0,
    headshots INTEGER DEFAULT 0,
    stat_aim INTEGER DEFAULT 0,
    stat_reaction INTEGER DEFAULT 0,
    stat_strategy INTEGER DEFAULT 0,
    stat_teamplay INTEGER DEFAULT 0,
    color VARCHAR(20) DEFAULT '#00f5ff',
    photo_url TEXT,
    bio TEXT,
    country VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p13298661_esports_team_project.players
    (tag, name, role, rank, rating, kd_ratio, winrate, headshots, stat_aim, stat_reaction, stat_strategy, stat_teamplay, color)
VALUES
    ('PHANTOM', 'Алексей Морозов', 'Капитан / AWP',     'Grandmaster', 2847, 1.42, 68, 54, 94, 88, 92, 97, '#00f5ff'),
    ('VIPER',   'Дмитрий Краснов', 'Entry Fragger',     'Elite',       2631, 1.38, 63, 61, 97, 95, 74, 82, '#ff00ff'),
    ('ORACLE',  'Иван Петров',     'IGL / Support',     'Master',      2519, 1.21, 71, 44, 78, 80, 99, 98, '#00ff88'),
    ('GHOST',   'Никита Волков',   'Lurker',             'Elite',       2478, 1.29, 61, 58, 86, 91, 85, 79, '#ffaa00'),
    ('NOVA',    'Артём Сидоров',   'Rifler',             'Master',      2412, 1.19, 64, 52, 88, 84, 81, 90, '#ff4466');
