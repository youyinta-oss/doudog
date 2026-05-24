import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const totalCoins = db.prepare('SELECT SUM(coins) as sum FROM users').get() as { sum: number };
    const totalMods = db.prepare('SELECT COUNT(*) as count FROM mods WHERE is_active = 1').get() as { count: number };
    const todaySales = db.prepare(`
      SELECT COUNT(*) as count FROM user_mods
      WHERE date(purchased_at) = date('now')
    `).get() as { count: number };

    res.json({
      success: true,
      data: {
        total_users: totalUsers.count,
        total_coins: totalCoins.sum || 0,
        total_mods: totalMods.count,
        today_sales: todaySales.count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM user_mods WHERE user_id = u.id) as mod_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
});

router.get('/users/:id', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM user_mods WHERE user_id = u.id) as mod_count
      FROM users u
      WHERE u.id = ?
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
});

router.post('/users/:id/give-coins', (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(amount, req.params.id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      data: updatedUser,
      message: `Successfully gave ${amount} coins to user`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to give coins',
    });
  }
});

router.post('/users/:id/give-mod', (req, res) => {
  try {
    const { mod_id } = req.body;
    if (!mod_id) {
      return res.status(400).json({
        success: false,
        error: 'Mod ID is required',
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const mod = db.prepare('SELECT * FROM mods WHERE id = ?').get(mod_id);
    if (!mod) {
      return res.status(404).json({
        success: false,
        error: 'Mod not found',
      });
    }

    const existingUserMod = db.prepare(
      'SELECT * FROM user_mods WHERE user_id = ? AND mod_id = ?'
    ).get(req.params.id, mod_id);

    if (existingUserMod) {
      return res.status(400).json({
        success: false,
        error: 'User already owns this mod',
      });
    }

    db.prepare(
      'INSERT INTO user_mods (user_id, mod_id) VALUES (?, ?)'
    ).run(req.params.id, mod_id);

    const userMod = db.prepare(
      'SELECT um.*, m.name as mod_name, m.model_path FROM user_mods um JOIN mods m ON um.mod_id = m.id WHERE um.user_id = ? AND um.mod_id = ?'
    ).get(req.params.id, mod_id);

    res.json({
      success: true,
      data: userMod,
      message: `Successfully gave ${(mod as { name: string }).name} to user`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to give mod',
    });
  }
});

export default router;
