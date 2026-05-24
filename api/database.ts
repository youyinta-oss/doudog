import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    coins INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url VARCHAR(500),
    model_path VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'default',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_mods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mod_id INTEGER NOT NULL,
    equipped BOOLEAN DEFAULT 0,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (mod_id) REFERENCES mods(id),
    UNIQUE(user_id, mod_id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_identifier ON users(identifier);
  CREATE INDEX IF NOT EXISTS idx_user_mods_user ON user_mods(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_mods_mod ON user_mods(mod_id);
`);

const existingMods = db.prepare('SELECT COUNT(*) as count FROM mods').get() as { count: number };
if (existingMods.count === 0) {
  const insertMod = db.prepare(`
    INSERT INTO mods (name, description, price, image_url, model_path, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const mods = [
    ['赛博朋克战士', '未来科技风格的赛博朋克战士模型', 500, '/images/cyberpunk.png', 'mp_m_freemode_01', 'cyberpunk'],
    ['中世纪骑士', '经典中世纪骑士盔甲模型', 300, '/images/knight.png', 'mp_m_freemode_01', 'medieval'],
    ['现代特种兵', '现代军事风格的特种兵模型', 400, '/images/soldier.png', 'mp_m_freemode_01', 'military'],
    ['街头混混', '街头风格的休闲角色模型', 200, '/images/street.png', 'mp_m_freemode_01', 'casual'],
    ['超级英雄', '经典超级英雄风格的角色模型', 600, '/images/hero.png', 'mp_m_freemode_01', 'hero'],
  ];

  for (const mod of mods) {
    insertMod.run(...mod);
  }
}

const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (existingUsers.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (identifier, name, coins)
    VALUES (?, ?, ?)
  `);

  const users = [
    ['license:abc123def456', 'PlayerOne', 1000],
    ['license:xyz789ghi012', 'GamerPro', 2500],
    ['license:mno345pqr678', 'NeonNinja', 500],
  ];

  for (const user of users) {
    insertUser.run(...user);
  }
}

export default db;
