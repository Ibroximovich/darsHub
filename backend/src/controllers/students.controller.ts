import { Response } from 'express';
import pool from '../db/index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const getTeacherId = (req: AuthRequest) => req.user?.id;

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { full_name, phone, parent_name, parent_phone } = req.body;
    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ success: false, message: 'full_name majburiy' });
    }

    const result = await pool.query(
      `INSERT INTO students (full_name, phone, parent_name, parent_phone, teacher_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, phone, parent_name, parent_phone, teacher_id, created_at`,
      [String(full_name).trim(), phone ? String(phone).trim() : null, parent_name ? String(parent_name).trim() : null, parent_phone ? String(parent_phone).trim() : null, teacherId]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const result = await pool.query(
      `SELECT id, full_name, phone, parent_name, parent_phone, teacher_id, created_at
       FROM students
       WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [teacherId]
    );

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, full_name, phone, parent_name, parent_phone, teacher_id, created_at
       FROM students
       WHERE id = $1 AND teacher_id = $2`,
      [id, teacherId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talaba topilmadi' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get student error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { id } = req.params;
    const { full_name, phone, parent_name, parent_phone } = req.body;

    const existing = await pool.query(
      'SELECT id FROM students WHERE id = $1 AND teacher_id = $2',
      [id, teacherId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talaba topilmadi' });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (full_name !== undefined) {
      updates.push(`full_name = $${values.length + 1}`);
      values.push(String(full_name).trim());
    }

    if (phone !== undefined) {
      updates.push(`phone = $${values.length + 1}`);
      values.push(phone ? String(phone).trim() : null);
    }

    if (parent_name !== undefined) {
      updates.push(`parent_name = $${values.length + 1}`);
      values.push(parent_name ? String(parent_name).trim() : null);
    }

    if (parent_phone !== undefined) {
      updates.push(`parent_phone = $${values.length + 1}`);
      values.push(parent_phone ? String(parent_phone).trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Hech qanday maydon berilmagan' });
    }

    values.push(teacherId);
    values.push(id);

    const result = await pool.query(
      `UPDATE students
       SET ${updates.join(', ')}
       WHERE teacher_id = $${values.length - 1} AND id = $${values.length}
       RETURNING id, full_name, phone, parent_name, parent_phone, teacher_id, created_at`,
      values
    );

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 AND teacher_id = $2 RETURNING id',
      [id, teacherId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talaba topilmadi' });
    }

    return res.json({ success: true, data: { deletedId: Number(id) } });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const addStudentToGroup = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { id, groupId } = req.params;

    const student = await pool.query('SELECT id FROM students WHERE id = $1 AND teacher_id = $2', [id, teacherId]);
    if (student.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talaba topilmadi' });
    }

    const group = await pool.query('SELECT id FROM groups WHERE id = $1 AND teacher_id = $2', [groupId, teacherId]);
    if (group.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
    }

    const existing = await pool.query(
      'SELECT id FROM group_students WHERE group_id = $1 AND student_id = $2',
      [groupId, id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Talaba allaqachon bu guruhga qo\'shilgan' });
    }

    const inserted = await pool.query(
      'INSERT INTO group_students (group_id, student_id) VALUES ($1, $2) RETURNING id, group_id, student_id',
      [groupId, id]
    );

    return res.status(201).json({ success: true, data: inserted.rows[0] });
  } catch (error) {
    console.error('Add student to group error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const removeStudentFromGroup = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = getTeacherId(req);
    if (!teacherId) {
      return res.status(401).json({ success: false, message: 'Token topilmadi' });
    }

    const { id, groupId } = req.params;

    const student = await pool.query('SELECT id FROM students WHERE id = $1 AND teacher_id = $2', [id, teacherId]);
    if (student.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talaba topilmadi' });
    }

    const group = await pool.query('SELECT id FROM groups WHERE id = $1 AND teacher_id = $2', [groupId, teacherId]);
    if (group.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Guruh topilmadi' });
    }

    const result = await pool.query(
      'DELETE FROM group_students WHERE group_id = $1 AND student_id = $2 RETURNING id',
      [groupId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Talaba bu guruhda yo\'q' });
    }

    return res.json({ success: true, data: { removed: true } });
  } catch (error) {
    console.error('Remove student from group error:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};
