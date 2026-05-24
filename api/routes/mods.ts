import { Router } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const mods = db.prepare(`
      SELECT * FROM mods WHERE is_active = 1 ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      data: mods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mods',
    });
  }
});

router.get('/admin', (req, res) => {
  try {
    const mods = db.prepare(`
      SELECT * FROM mods ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      data: mods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mods',
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const mod = db.prepare('SELECT * FROM mods WHERE id = ?').get(req.params.id);

    if (!mod) {
      return res.status(404).json({
        success: false,
        error: 'Mod not found',
      });
    }

    res.json({
      success: true,
      data: mod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mod',
    });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, description, price, image_url, model_path, category } = req.body;

    if (!name || !price || !model_path) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, and model_path are required',
      });
    }

    const result = db.prepare(`
      INSERT INTO mods (name, description, price, image_url, model_path, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, description || '', price, image_url || '', model_path, category || 'default');

    const newMod = db.prepare('SELECT * FROM mods WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: newMod,
      message: 'Mod created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create mod',
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, description, price, image_url, model_path, category, is_active } = req.body;

    const mod = db.prepare('SELECT * FROM mods WHERE id = ?').get(req.params.id);
    if (!mod) {
      return res.status(404).json({
        success: false,
        error: 'Mod not found',
      });
    }

    db.prepare(`
      UPDATE mods SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        image_url = COALESCE(?, image_url),
        model_path = COALESCE(?, model_path),
        category = COALESCE(?, category),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, description, price, image_url, model_path, category, is_active, req.params.id);

    const updatedMod = db.prepare('SELECT * FROM mods WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      data: updatedMod,
      message: 'Mod updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update mod',
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const mod = db.prepare('SELECT * FROM mods WHERE id = ?').get(req.params.id);
    if (!mod) {
      return res.status(404).json({
        success: false,
        error: 'Mod not found',
      });
    }

    db.prepare('DELETE FROM user_mods WHERE mod_id = ?').run(req.params.id);
    db.prepare('DELETE FROM mods WHERE id = ?').run(req.params.id);

    res.json({
      success: true,
      message: 'Mod deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete mod',
    });
  }
});

export default router;
