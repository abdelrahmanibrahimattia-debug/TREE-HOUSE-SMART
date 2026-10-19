import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getLedger(req, res) {
  try {
    const { empCode, type, page = 1, limit = 50 } = req.query;
    const where = {};
    if (empCode) where.empCode = String(empCode).trim();
    if (type) where.type = type;

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, entries] = await Promise.all([
      prisma.financialLedger.count({ where }),
      prisma.financialLedger.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return sendSuccess(res, entries, 'سجل الحركات المالية المركزية', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب سجل الحركات المالية: ' + error.message, 500);
  }
}

export async function createLedgerEntry(req, res) {
  try {
    const { empCode, empName, type, amount, description, date } = req.body;
    if (!empCode || !type || amount === undefined) {
      return sendError(res, 'كود الموظف، نوع الحركة، والمبلغ حقول مطلوبة.', 400);
    }

    const entry = await prisma.financialLedger.create({
      data: {
        date: date || new Date().toISOString().split('T')[0],
        empCode: String(empCode).trim(),
        empName: empName || req.user.name,
        type,
        amount: Number(amount) || 0,
        description: description || '',
        enteredBy: req.user.name
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_LEDGER_ENTRY',
      resource: 'LEDGER',
      resourceId: entry.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { empCode, type, amount }
    });

    return sendSuccess(res, entry, 'تم تسجيل الحركة المالية في السجل المركزي بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر تسجيل الحركة المالية: ' + error.message, 500);
  }
}
