import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAudit } from '../utils/auditLogger.js';

export async function getAppliances(req, res) {
  try {
    const { customerCode } = req.query;
    const where = {};
    if (customerCode) where.customerCode = String(customerCode).trim().toUpperCase();

    const appliances = await prisma.appliance.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, appliances, 'قائمة الأجهزة الفنية والمطابقة');
  } catch (error) {
    return sendError(res, 'فشل جلب قائمة الأجهزة: ' + error.message, 500);
  }
}

export async function createAppliance(req, res) {
  try {
    const { customerCode, name, type, width, height, depth, quantity = 1, location, notes } = req.body;
    if (!customerCode || !name) {
      return sendError(res, 'كود العميل واسم الجهاز حقول مطلوبة.', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { code: String(customerCode).trim().toUpperCase() }
    });
    if (!customer) return sendError(res, 'العميل غير مسجل.', 404);

    const appliance = await prisma.appliance.create({
      data: {
        customerCode: customer.code,
        name: String(name).trim(),
        type: type || 'Built-in',
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
        depth: depth ? Number(depth) : null,
        quantity: Number(quantity) || 1,
        location: location || null,
        notes: notes || null
      }
    });

    await logAudit({
      userId: req.user.id,
      userCode: req.user.code,
      userName: req.user.name,
      action: 'CREATE_APPLIANCE',
      resource: 'APPLIANCES',
      resourceId: appliance.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { customerCode: customer.code, appliance: appliance.name }
    });

    return sendSuccess(res, appliance, 'تم تسجيل مواصفات الجهاز بنجاح.', 201);
  } catch (error) {
    return sendError(res, 'تعذر تسجيل الجهاز: ' + error.message, 500);
  }
}

export async function deleteAppliance(req, res) {
  try {
    const { id } = req.params;
    await prisma.appliance.delete({ where: { id } });
    return sendSuccess(res, null, 'تم حذف الجهاز بنجاح.');
  } catch (error) {
    return sendError(res, 'تعذر حذف الجهاز: ' + error.message, 500);
  }
}
