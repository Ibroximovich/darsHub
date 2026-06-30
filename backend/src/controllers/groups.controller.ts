import { Response } from 'express';
import pool from '../db/index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const getTeacherId = (req: AuthRequest) => req.user?.id;

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { name, subject, schedule } = req.body;
    if (!name || !subject) {
      return res.status(400).json({ success: false, message: 'Name va subject majburiy' });
    }

    const result = await pool.query(
      `INSERT INTO groups (name, subject, schedule, teacher_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, subject, schedule, teacher_id, created_at`,
      [String(name).trim(), String(subject).trim(), schedule ? String(schedule).trim() : null, teacherId]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const result = await pool.query(
      `SELECT id, name, subject, schedule, teacher_id, created_at
       FROM groups
       WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [teacherId]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get groups error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const getGroupById = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, subject, schedule, teacher_id, created_at
       FROM groups
       WHERE id = $1 AND teacher_id = $2`,
      [id, teacherId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get group error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { id } = req.params;
    const { name, subject, schedule } = req.body;

    const existing = await pool.query(
      'SELECT id FROM groups WHERE id = $1 AND teacher_id = $2',
      [id, teacherId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (name !== undefined) {
      updates.push(`name = $${values.length + 1}`);
      values.push(String(name).trim());
    }

    if (subject !== undefined) {
      updates.push(`subject = $${values.length + 1}`);
      values.push(String(subject).trim());
    }

    if (schedule !== undefined) {
      updates.push(`schedule = $${values.length + 1}`);
      values.push(schedule ? String(schedule).trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Hech qanday maydon berilmagan' });
    }

    values.push(teacherId);
    values.push(id);

    const result = await pool.query(
      `UPDATE groups
       SET ${updates.join(', ')}
       WHERE teacher_id = $${values.length - 1} AND id = $${values.length}
       RETURNING id, name, subject, schedule, teacher_id, created_at`,
      values
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update group error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM groups WHERE id = $1 AND teacher_id = $2 RETURNING id',
      [id, teacherId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
    }

    return res.json({ success: true, data: { deletedId: Number(id) } });
  } catch (error) {
    console.error('Delete group error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};
