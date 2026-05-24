import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/:identifier/mods', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE identifier = ?').get(req.params.identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const userMods = db.prepare(`
      SELECT um.*, m.name, m.description, m.price, m.image_url, m.model_path, m.category
      FROM user_mods um
      JOIN mods m ON um.mod_id = m.id
      WHERE um.user_id = ?
      ORDER BY um.purchased_at DESC
    `).all((user as { id: number }).id);

    res.json({
      success: true,
      data: userMods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user mods',
    });
  }
});

router.get('/:identifier/coins', (req, res) => {
  try {
    const user = db.prepare('SELECT id, identifier, name, coins FROM users WHERE identifier = ?').get(req.params.identifier);

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
      error: 'Failed to fetch user coins',
    });
  }
});

router.post('/:identifier/buy-mod', (req, res) => {
  try {
    const { mod_id } = req.body;
    if (!mod_id) {
      return res.status(400).json({
        success: false,
        error: 'Mod ID is required',
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE identifier = ?').get(req.params.identifier) as { id: number; coins: number } | undefined;
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const mod = db.prepare('SELECT * FROM mods WHERE id = ? AND is_active = 1').get(mod_id) as { id: number; price: number; name: string } | undefined;
    if (!mod) {
      return res.status(404).json({
        success: false,
        error: 'Mod not found',
      });
    }

    const existingUserMod = db.prepare(
      'SELECT * FROM user_mods WHERE user_id = ? AND mod_id = ?'
    ).get(user.id, mod_id);

    if (existingUserMod) {
      return res.status(400).json({
        success: false,
        error: 'You already own this mod',
      });
    }

    if (user.coins < mod.price) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient coins',
      });
    }

    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(mod.price, user.id);
    db.prepare('INSERT INTO user_mods (user_id, mod_id) VALUES (?, ?)').run(user.id, mod_id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

    res.json({
      success: true,
      data: {
        user: updatedUser,
        mod: mod,
      },
      message: `Successfully purchased ${mod.name}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to purchase mod',
    });
  }
});

router.post('/:identifier/equip-mod', (req, res) => {
  try {
    const { mod_id } = req.body;
    if (!mod_id) {
      return res.status(400).json({
        success: false,
        error: 'Mod ID is required',
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE identifier = ?').get(req.params.identifier) as { id: number } | undefined;
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const userMod = db.prepare(
      'SELECT * FROM user_mods WHERE user_id = ? AND mod_id = ?'
    ).get(user.id, mod_id);

    if (!userMod) {
      return res.status(404).json({
        success: false,
        error: 'You do not own this mod',
      });
    }

    db.prepare('UPDATE user_mods SET equipped = 0 WHERE user_id = ?').run(user.id);
    db.prepare('UPDATE user_mods SET equipped = 1 WHERE user_id = ? AND mod_id = ?').run(user.id, mod_id);

    const equippedMod = db.prepare(`
      SELECT um.*, m.name, m.model_path
      FROM user_mods um
      JOIN mods m ON um.mod_id = m.id
      WHERE um.user_id = ? AND um.mod_id = ?
    `).get(user.id, mod_id);

    res.json({
      success: true,
      data: equippedMod,
      message: 'Mod equipped successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to equip mod',
    });
  }
});

router.get('/:identifier/equipped-mod', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE identifier = ?').get(req.params.identifier) as { id: number } | undefined;
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const equippedMod = db.prepare(`
      SELECT um.*, m.name, m.model_path, m.description, m.image_url
      FROM user_mods um
      JOIN mods m ON um.mod_id = m.id
      WHERE um.user_id = ? AND um.equipped = 1
    `).get(user.id);

    res.json({
      success: true,
      data: equippedMod || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch equipped mod',
    });
  }
});

export default router;
