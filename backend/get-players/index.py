import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: dict, context) -> dict:
    """Возвращает список всех активных игроков команды из базы данных."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Создаём таблицу если её нет (в текущей схеме пользователя функции)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS players (
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
        )
    """)

    cur.execute("SELECT COUNT(*) AS cnt FROM players")
    cnt = cur.fetchone()['cnt']

    if cnt == 0:
        cur.execute("""
            INSERT INTO players (tag, name, role, rank, rating, kd_ratio, winrate, headshots, stat_aim, stat_reaction, stat_strategy, stat_teamplay, color)
            VALUES
                ('PHANTOM', 'Алексей Морозов', 'Капитан / AWP',  'Grandmaster', 2847, 1.42, 68, 54, 94, 88, 92, 97, '#00f5ff'),
                ('VIPER',   'Дмитрий Краснов', 'Entry Fragger',  'Elite',       2631, 1.38, 63, 61, 97, 95, 74, 82, '#ff00ff'),
                ('ORACLE',  'Иван Петров',     'IGL / Support',  'Master',      2519, 1.21, 71, 44, 78, 80, 99, 98, '#00ff88'),
                ('GHOST',   'Никита Волков',   'Lurker',          'Elite',       2478, 1.29, 61, 58, 86, 91, 85, 79, '#ffaa00'),
                ('NOVA',    'Артём Сидоров',   'Rifler',          'Master',      2412, 1.19, 64, 52, 88, 84, 81, 90, '#ff4466')
            ON CONFLICT (tag) DO NOTHING
        """)
        conn.commit()

    cur.execute("""
        SELECT
            id, tag, name, role, rank, rating,
            CAST(kd_ratio AS FLOAT) AS kd,
            winrate, headshots,
            stat_aim, stat_reaction, stat_strategy, stat_teamplay,
            color, photo_url, bio, country
        FROM players
        WHERE active = TRUE
        ORDER BY rating DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    players = []
    for r in rows:
        players.append({
            'id': r['id'],
            'tag': r['tag'],
            'name': r['name'],
            'role': r['role'],
            'rank': r['rank'],
            'rating': r['rating'],
            'kd': r['kd'],
            'winrate': r['winrate'],
            'headshots': r['headshots'],
            'stats': {
                'aim': r['stat_aim'],
                'reaction': r['stat_reaction'],
                'strategy': r['stat_strategy'],
                'teamplay': r['stat_teamplay'],
            },
            'color': r['color'],
            'photo_url': r['photo_url'],
            'bio': r['bio'],
            'country': r['country'],
        })

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'players': players}, ensure_ascii=False)
    }
