import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getAttendance(req, res) {
  try {
    const { empCode, date } = req.query;
    const where = {};
    if (empCode) where.empCode = String(empCode).trim();
    if (date) where.date = date;

    const list = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return sendSuccess(res, list, 'سجل الحضور والانصراف');
  } catch (error) {
    return sendError(res, 'فشل جلب الحضور: ' + error.message, 500);
  }
}

export async function recordAttendance(req, res) {
  try {
    const { empCode, empName, checkIn, checkOut, status = 'حاضر', notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const record = await prisma.attendanceRecord.create({
      data: {
        empCode: empCode || req.user.code,
        empName: empName || req.user.name,
        date: today,
        checkIn: checkIn || new Date().toLocaleTimeString('ar-EG'),
        checkOut: checkOut || null,
        status,
        notes: notes || null
      }
    });

    return sendSuccess(res, record, 'تم تسجيل الحضور بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر تسجيل الحضور: ' + error.message, 500);
  }
}
