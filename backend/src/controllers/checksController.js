import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getChecks(req, res) {
  try {
    const { customerCode, page = 1, limit = 50 } = req.query;
    const where = {};
    if (customerCode) where.customerCode = String(customerCode).trim();

    const take = Math.min(Number(limit) || 50, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [total, checks] = await Promise.all([
      prisma.check.count({ where }),
      prisma.check.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, phone: true }
          }
        }
      })
    ]);

    const formatted = checks.map(c => ({
      ...c,
      customerName: c.customer?.name || c.customerCode
    }));

    return sendSuccess(res, formatted, 'قائمة التشيكات والمعاينات', 200, {
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (error) {
    return sendError(res, 'فشل جلب التشيكات: ' + error.message, 500);
  }
}

export async function createCheck(req, res) {
  try {
    const {
      customerCode,
      date,
      location,
      notes,
      contractType = 'الفرش كامل',
      fileName,
      fileUrl,
      mimeType
    } = req.body;

    if (!customerCode || !date) {
      return sendError(res, 'كود العميل وتاريخ التشيكة حقول إلزامية.', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { code: String(customerCode).trim().toUpperCase() }
    });

    if (!customer) {
      return sendError(res, 'العميل غير موجود بالنظام.', 404);
    }

    const count = await prisma.check.count();
    const code = `CHK-${String(count + 1).padStart(4, '0')}`;

    const check = await prisma.check.create({
      data: {
        code,
        customerId: customer.id,
        customerCode: customer.code,
        date: String(date),
        location: location || customer.address || null,
        responsible: req.user.name,
        status: 'معتمد',
        contractType: contractType || 'الفرش كامل',
        notes: notes || null,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
        mimeType: mimeType || 'image/jpeg'
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_CHECK',
      resource: 'CHECKS',
      resourceId: check.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { checkCode: check.code, customerCode: customer.code, contractType }
    });

    return sendSuccess(res, check, 'تم تسجيل التشيكة بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر تسجيل التشيكة: ' + error.message, 500);
  }
}
